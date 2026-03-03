const mongoose = require("mongoose");
const Product = require("@models/product");
const Order = require("@models/product-request");
const response = require("../../responses");
const axios = require("axios");
const EASYSHIP_API_URL = process.env.EASYSHIP_API_URL;
const EASYSHIP_TOKEN = process.env.EASYSHIP_TOKEN;
const ProductRequest = require("@models/product-request");


const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${EASYSHIP_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

module.exports = {
  getShippingRates: async (req, res) => {
    try {
      const { destination_address, parcel } = req.body;

      if (!destination_address) {
        return res
          .status(400)
          .json({ message: "Destination address required" });
      }

      const origin_address = {
        country_alpha2: "AU",
        state: "New South Wales",
        city: "Sydney",
        postal_code: "2000",
        line_1: "Level 5, 123 George Street",
      };

      const parcels = [
        {
          items: [
            {
              quantity: 1,
              actual_weight: parcel?.weight || 0.5,
              dimensions: {
                length: parcel?.length || 25,
                width: parcel?.width || 20,
                height: parcel?.height || 5,
              },
              declared_customs_value: parcel?.declaredValue || 10,
              declared_currency: "USD",
              origin_country_alpha2: "AU",
              category: "fashion",
              contains_battery_pi966: false,
              contains_battery_pi967: false,
              contains_liquids: false,
            },
          ],
        },
      ];

      const exchangeRes = await axios.get(
        "https://open.er-api.com/v6/latest/USD",
      );
      const usdRates = exchangeRes.data.rates;

      const result = await axios.post(
        `${EASYSHIP_API_URL}/rates`,
        {
          origin_address,
          destination_address,
          parcels,
          incoterms: "DDU",
          insurance: { is_insured: false },

          courier_settings: {
            apply_shipping_rules: true,
            show_courier_logo_url: true,
          },

          shipping_settings: {
            units: {
              weight: "kg",
              dimensions: "cm",
            },
          },
        },
        getHeaders(),
      );

      const rates = result.data.rates.map((rate) => {
        const originalCurrency = rate.currency;
        const conversionRate = usdRates[originalCurrency] || 1;

        const priceInUSD = (rate.total_charge / conversionRate).toFixed(2);

        return {
          courier_service_id: rate.courier_service.id,
          courier_name: rate.courier_service.name,
          logo: rate.courier_service.logo,
          min_days: rate.min_delivery_time,
          max_days: rate.max_delivery_time,
          delivery_type: rate.min_delivery_time <= 2 ? "Express" : "Standard",
          price: Number(priceInUSD),
          currency: "USD",
          original_price: rate.total_charge,
          original_currency: originalCurrency,

          has_extra_charges: rate.oversized_surcharge > 0,
        };
      });

      return response.ok(res, rates, {
        message: "Shipping rates fetched successfully",
      });
    } catch (error) {
      console.error(
        "Easyship Rate Error:",
        error.response?.data || error.message,
      );
      return response.error(res, error);
    }
  },

  trackShipment: async (req, res) => {
    try {
      const { shipmentId } = req.params;
      if (!shipmentId) {
        return res.status(400).json({ message: "Shipment ID required" });
      }

      const result = await axios.get(
        `${EASYSHIP_API_URL}/shipments/trackings`,
        {
          params: {
            "easyship_shipment_id[]": shipmentId,
            include_checkpoints: true,
          },
          ...getHeaders(),
        },
      );

      return response.ok(res, result.data, {
        message: "Tracking fetched successfully",
      });
    } catch (error) {
      console.error(
        "Easyship tracking error:",
        error.response?.data || error.message,
      );
      return response.error(res, error);
    }
  },

  createShipmentManually: async (req, res) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ message: "Order ID required" });
      }

      const order = await ProductRequest.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.easyship_shipment_id) {
        return res.status(400).json({
          message: "Shipment already created for this order",
        });
      }

      console.log(order.parcels.items);
      
      const shipmentRes = await axios.post(
        `${EASYSHIP_API_URL}/shipments`,
        {
          origin_address: {
            line_1: "Level 5, 123 George Street",
            city: "Sydney",
            state: "New South Wales",
            postal_code: "2000",
            country_alpha2: "AU",
            contact_name: "Warehouse Manager",
            contact_phone: "+61400000000",
            company_name: "Jaszno & Co",
            contact_email: "warehouse@example.com",
          },

          destination_address: order.destination_address,

          incoterms: "DDU",

          courier_settings: {
            allow_fallback: false,
            apply_shipping_rules: true,
            courier_service_id: order.courier_service_id,
            list_unavailable_services: true,
          },

          shipping_settings: {
            units: {
              weight: "kg",
              dimensions: "cm",
            },
          },

          parcels: order?.parcels,
        },
        getHeaders(),
      );

      const easyshipShipmentId =
        shipmentRes?.data?.shipment?.easyship_shipment_id;

      if (!easyshipShipmentId) {
        return res.status(500).json({
          message: "Shipment creation failed",
        });
      }

      const labelRes = await axios.post(
        `${EASYSHIP_API_URL}/batches/labels`,
        {
          shipments: [{ easyship_shipment_id: easyshipShipmentId }],
        },
        getHeaders(),
      );

      const batchId = labelRes?.data?.batch?.id;

      order.easyship_shipment_id = easyshipShipmentId;
      order.batchId = batchId;
      order.status = "Shipped";

      await order.save();

      return res.status(200).json({
        message: "Shipment & Label created successfully",
        shipmentId: easyshipShipmentId,
        batchId,
      });
    } catch (error) {
      console.error("Manual Shipment Error:", error.response?.data || error);
      return res.status(500).json({
        message: "Shipment creation failed",
        error: error.response?.data || error.message,
      });
    }
  },

  webhookShippingUpdate: async (req, res) => {
    try {
      const signature = req.headers["x-easyship-signature"];
      if (!signature) {
        return res.sendStatus(200);
      }
      try {
        jwt.verify(signature, process.env.EASYSHIP_WEBHOOK_SECRET);
      } catch (err) {
        console.error("Invalid Easyship webhook signature");
        return res.sendStatus(200);
      }

      const { event_type, data } = req.body || {};
      const easyship_shipment_id = data?.easyship_shipment_id;

      if (!event_type || !easyship_shipment_id) {
        return res.sendStatus(200);
      }

      switch (event_type) {
        case "shipment.label.created":
          await Order.updateOne(
            { easyship_shipment_id },
            {
              labelUrl: data.label_url,
              trackingNumber: data.tracking_number,
              trackingPageUrl: data.tracking_page_url,
              status: "WAITING_FOR_PICKUP",
            },
          );
          break;

        case "shipment.label.failed":
          await Order.updateOne(
            { easyship_shipment_id },
            {
              status: "LABEL_FAILED",
              failureReason:
                data.error_messages?.[0]?.message || "Label generation failed",
            },
          );
          break;

        case "shipment.tracking.status.changed":
          await Order.updateOne(
            { easyship_shipment_id },
            {
              status: data.status,
              lastTrackingStatus: data.status,
              trackingNumber: data.tracking_number,
              trackingPageUrl: data.tracking_page_url,
            },
          );
          break;

        case "shipment.tracking.checkpoints.created":
          await Order.updateOne(
            { easyship_shipment_id },
            {
              $push: {
                checkpoints: {
                  $each: (data.checkpoints || []).map((cp) => ({
                    location: cp.location || "",
                    message: cp.message || cp.status || "",
                    status: cp.status,
                    trackedAt: cp.tracked_at
                      ? new Date(cp.tracked_at)
                      : new Date(),
                  })),
                },
              },
              easyshipTrackingStatus: data.status,
              trackingPageUrl: data.tracking_page_url,
            },
          );
          break;

        case "shipment.cancelled":
          await Order.updateOne(
            { easyship_shipment_id },
            { status: "CANCELLED" },
          );
          break;

        default:
          console.log("Unhandled Easyship event:", event_type);
      }
      return res.sendStatus(200);
    } catch (error) {
      console.error("Easyship webhook error:", error);
      return res.sendStatus(200);
    }
  },
};
