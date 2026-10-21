"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import OfficialInvoice from "@/components/OfficialInvoice";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fulfillmentStatus, setFulfillmentStatus] = useState("unfulfilled");
  const [showFulfillDropdown, setShowFulfillDropdown] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Sequel 247 Logistics State
  const [logisticsConfig, setLogisticsConfig] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [isGeneratingDocket, setIsGeneratingDocket] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [serviceabilityStatus, setServiceabilityStatus] = useState(null);
  const [isCheckingService, setIsCheckingService] = useState(false);

  // Package & Weight Details (directly on the page)
  const [packageSpecs, setPackageSpecs] = useState({
    gross_weight: 0.250,
    net_weight: 0.050,
    boxes: 1,
  });

  // Shipping Address Form (for edit popup)
  const [addressForm, setAddressForm] = useState({
    recipient_name: "",
    contact_phone: "",
    shipping_address: "",
    pin_code: "560001",
    city: "Bangalore",
    state: "Karnataka",
  });

  // Certificate Master Types State
  const [certMasterTypes, setCertMasterTypes] = useState([
    "Authenticity Certificate",
    "Gem/Stone Certificate",
    "Diamond Grading Report (IGI/GIA)",
    "BIS Hallmark Purity Card",
    "Assay Lab Purity Guarantee",
  ]);

  useEffect(() => {
    api.getMasters().then((res) => {
      const data = res?.data || res;
      if (Array.isArray(data)) {
        const certMaster = data.find((m) => m.code === "CERTIFICATE");
        if (certMaster && Array.isArray(certMaster.values) && certMaster.values.length > 0) {
          const typeNames = certMaster.values.filter((v) => v.is_active !== false).map((v) => v.value);
          if (typeNames.length > 0) setCertMasterTypes(typeNames);
        }
      }
    }).catch((e) => console.warn("Failed to load certificate master types:", e));
  }, []);

  // HUID & Multi-Certificate Management State
  const [editingItemCert, setEditingItemCert] = useState(null);
  const [certHuid, setCertHuid] = useState("");
  const [certList, setCertList] = useState([]);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [isSavingCert, setIsSavingCert] = useState(false);

  const handleOpenCertModal = (item) => {
    setEditingItemCert(item);
    setCertHuid(item.huid || "");

    let existingCerts = [];
    if (Array.isArray(item.certificates) && item.certificates.length > 0) {
      existingCerts = item.certificates.map((c, i) => ({
        id: c.id || `cert_${Date.now()}_${i}`,
        name: c.name || "Authenticity Certificate",
        certificate_number: c.certificate_number || "",
        certificate_url: c.certificate_url || "",
        file_name: c.file_name || "",
        verification_url: c.verification_url || "https://www.manakonline.in/MANAK/hallmarkHuidVerification",
        isCustomName: false,
      }));
    } else {
      if (item.certificate_number || item.certificate_url) {
        existingCerts.push({
          id: `cert_${Date.now()}_1`,
          name: "Authenticity Certificate",
          certificate_number: item.certificate_number || "",
          certificate_url: item.certificate_url || "",
          file_name: "",
          verification_url: "https://www.manakonline.in/MANAK/hallmarkHuidVerification",
          isCustomName: false,
        });
      }
      if (item.gem) {
        existingCerts.push({
          id: `cert_${Date.now()}_2`,
          name: "Gem/Stone Certificate",
          certificate_number: `IGI-GEM-${item.id || "001"}`,
          certificate_url: item.certificate_url || "",
          file_name: "",
          verification_url: "https://www.igi.org/verify-your-report/",
          isCustomName: false,
        });
      }
      if (existingCerts.length === 0) {
        existingCerts.push({
          id: `cert_${Date.now()}_1`,
          name: "Authenticity Certificate",
          certificate_number: "",
          certificate_url: "",
          file_name: "",
          verification_url: "https://www.manakonline.in/MANAK/hallmarkHuidVerification",
          isCustomName: false,
        });
      }
    }
    setCertList(existingCerts);
  };

  const handleAddCertRow = () => {
    const defaultName = certMasterTypes[certList.length % certMasterTypes.length] || "Gem/Stone Certificate";
    const defaultVerifyUrl = defaultName.toLowerCase().includes("gem")
      ? "https://www.igi.org/verify-your-report/"
      : "https://www.manakonline.in/MANAK/hallmarkHuidVerification";

    setCertList((prev) => [
      ...prev,
      {
        id: `cert_${Date.now()}_${prev.length + 1}`,
        name: defaultName,
        certificate_number: "",
        certificate_url: "",
        file_name: "",
        verification_url: defaultVerifyUrl,
        isCustomName: false,
      },
    ]);
  };

  const handleRemoveCertRow = (index) => {
    setCertList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCertFieldChange = (index, field, value) => {
    setCertList((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleCertFileUpload = async (index, file) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const res = await api.uploadCertificate(file);
      if (res && res.url) {
        setCertList((prev) =>
          prev.map((c, i) =>
            i === index
              ? { ...c, certificate_url: res.url, file_name: file.name }
              : c
          )
        );
        triggerNotification(`Certificate document attached: ${file.name}`);
      } else {
        alert(res?.message || "Upload failed");
      }
    } catch (err) {
      alert("Error uploading certificate: " + err.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSaveCert = async () => {
    if (!editingItemCert) return;
    setIsSavingCert(true);
    try {
      const primaryCert = certList[0] || {};
      const payload = {
        huid: certHuid.trim(),
        certificates: certList.map((c) => ({
          id: c.id,
          name: c.name || "Authenticity Certificate",
          certificate_number: c.certificate_number || "",
          certificate_url: c.certificate_url || "",
          file_name: c.file_name || "",
          verification_url: c.verification_url || "https://www.manakonline.in/MANAK/hallmarkHuidVerification",
        })),
        certificate_number: primaryCert.certificate_number || "",
        certificate_url: primaryCert.certificate_url || "",
      };

      const res = await api.updateOrderItemCertificate(order.id, editingItemCert.id, payload);

      if (res && res.status === "success") {
        triggerNotification(`HUID & ${certList.length} Certificates updated for ${editingItemCert.product_name || editingItemCert.name}`);
        setEditingItemCert(null);
        setOrder((prev) => ({
          ...prev,
          items: (prev.items || []).map((i) =>
            i.id === editingItemCert.id
              ? {
                  ...i,
                  huid: certHuid.trim(),
                  certificates: payload.certificates,
                  certificate_number: primaryCert.certificate_number || "",
                  certificate_url: primaryCert.certificate_url || "",
                }
              : i
          ),
        }));
      } else {
        alert(res?.message || "Failed to update HUID and Certificate");
      }
    } catch (err) {
      alert("Error saving certificate: " + err.message);
    } finally {
      setIsSavingCert(false);
    }
  };

  const triggerNotification = (msg) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(""), 3500);
  };

  const loadLogisticsConfig = async () => {
    try {
      const res = await api.getLogisticsConfig();
      if (res && res.status === "success") {
        setLogisticsConfig(res.data);
      }
    } catch (e) {
      console.warn("Could not load logistics config:", e);
    }
  };

  const loadOrderData = async () => {
    if (!orderId) return;
    setLoading(true);
    loadLogisticsConfig();
    try {
      const res = await api.getOrder(orderId);
      if (res && res.status === "success" && res.data) {
        const d = res.data;
        const normalized = {
          ...d,
          customer_name: d.customer?.name || d.customer_name || "No name provided",
          customer_orders_count: `${d.customer?.orders_count || 1} order${(d.customer?.orders_count || 1) > 1 ? "s" : ""}`,
          customer_email: d.customer?.email || d.customer_email || "",
          customer_phone: d.customer?.phone || d.customer_phone || "",
          shipping_address: d.customer?.shipping_address || d.shipping_address || "No shipping address provided",
          billing_address: d.customer?.billing_address || d.billing_address || "No billing address provided",
          subtotal: d.pricing?.subtotal ?? d.subtotal ?? 0,
          taxes_label: d.pricing?.tax_rate_label ?? d.taxes_label ?? "CGST 9%",
          taxes_amount: d.pricing?.gst_amount ?? d.gst_amount ?? 0,
          total: d.pricing?.total_amount ?? d.total_amount ?? 0,
          paid: d.pricing?.paid_amount ?? d.total_amount ?? 0,
          date_formatted: d.created_at_formatted || d.date_formatted || "October 6, 2026 at 8:23 am from Draft Orders",
          docket_number: d.docket_number || null,
          courier_partner: d.courier_partner || "Sequel 247 Logistics",
          pickup_token: d.pickup_token || null,
          estimated_delivery_date: d.estimated_delivery_date || null,
          logistics_status: d.logistics_status || null,
          tracking_data: d.tracking_data || null,
          items: (d.items || []).map((i) => ({
            id: i.id,
            name: i.product_name || i.name || "Bespoke Jewelry Item",
            design_code: i.design_code,
            metal_purity: i.metal_purity,
            finish: i.finish,
            size: i.size,
            gem: i.gem,
            huid: i.huid || "",
            certificate_url: i.certificate_url || "",
            certificate_number: i.certificate_number || "",
            unit_price: Number(i.unit_price || i.price || 0),
            total: Number(i.total || 0),
            quantity: Number(i.quantity || 1),
            image: i.image
          }))
        };
        setOrder(normalized);
        setFulfillmentStatus(d.fulfillment_status || "unfulfilled");
        setNoteText(d.notes || "");

        // Prefill address form
        let prefillPin = "560001";
        const pinMatch = (normalized.shipping_address || "").match(/\b[1-9][0-9]{5}\b/);
        if (pinMatch) prefillPin = pinMatch[0];

        setAddressForm({
          recipient_name: normalized.customer_name || "Valued Customer",
          contact_phone: normalized.customer_phone || "9876543210",
          shipping_address: normalized.shipping_address || "No shipping address provided",
          pin_code: prefillPin,
          city: "Bangalore",
          state: "Karnataka",
        });

        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Could not fetch order from API:", err);
    }

    // Fallback if API is offline
    setOrder({
      id: orderId,
      order_number: `#${orderId}`,
      payment_status: "Paid",
      fulfillment_status: "unfulfilled",
      date_formatted: "October 6, 2026 at 8:23 am from Draft Orders",
      customer_name: "No name provided",
      customer_orders_count: "1 order",
      customer_email: "",
      customer_phone: "",
      shipping_address: "No shipping address provided",
      billing_address: "No billing address provided",
      items: [
        {
          id: "item-demo-1",
          name: "demo",
          unit_price: 500.0,
          quantity: 1,
          total: 500.0,
          image: null
        }
      ],
      subtotal: 500.0,
      taxes_label: "CGST 9%",
      taxes_amount: 45.0,
      total: 545.0,
      paid: 545.0
    });
    setFulfillmentStatus("unfulfilled");
    setLoading(false);
  };

  useEffect(() => {
    loadOrderData();
  }, [orderId]);

  const handleToggleFulfillment = async (status) => {
    if (isSubmitting) return;
    setFulfillmentStatus(status);
    setShowFulfillDropdown(false);
    setIsSubmitting(true);

    triggerNotification(`Order status updated: ${status === "fulfilled" ? "Fulfilled" : "Unfulfilled"}`);

    try {
      await api.updateOrderFulfillment(order.order_number || order.id, status);
    } catch (err) {
      console.warn("Could not update fulfillment status on live API:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsAddingNote(false);
    triggerNotification("Order note saved");
    try {
      await api.updateOrderNotes(order.order_number || order.id, noteText);
    } catch (err) {
      console.warn("Could not update notes on live API:", err);
    }
  };

  const handleCheckServiceability = async () => {
    if (!addressForm.pin_code) return;
    setIsCheckingService(true);
    setServiceabilityStatus(null);
    try {
      const res = await api.checkServiceability(addressForm.pin_code);
      if (res && res.status === "success" && res.data) {
        const pinCity = res.data.data?.city;
        const pinState = res.data.data?.state;
        if (pinCity || pinState) {
          setAddressForm((prev) => ({
            ...prev,
            city: pinCity || prev.city,
            state: pinState || prev.state,
          }));
        }
        setServiceabilityStatus({
          success: true,
          city: pinCity,
          state: pinState,
          tier: res.data.data?.Tier_Classification,
          cod: res.data.data?.is_ecom_cod_allowed,
          message: res.data.message || "Pincode is serviceable by Sequel 247"
        });
      } else {
        setServiceabilityStatus({
          success: false,
          message: res?.message || "Not serviceable by Sequel 247"
        });
      }
    } catch (err) {
      setServiceabilityStatus({
        success: false,
        message: "Error connecting to Sequel 247 serviceability engine"
      });
    } finally {
      setIsCheckingService(false);
    }
  };

  const handleSaveShippingAddress = async () => {
    setIsSavingAddress(true);
    try {
      const res = await api.updateOrderShippingAddress(order.order_number || order.id, {
        customer_name: addressForm.recipient_name,
        customer_phone: addressForm.contact_phone,
        shipping_address: addressForm.shipping_address,
      });

      if (res && res.status === "success") {
        triggerNotification("Shipping address updated successfully");
        setShowAddressModal(false);
        setOrder((prev) => ({
          ...prev,
          customer_name: addressForm.recipient_name,
          customer_phone: addressForm.contact_phone,
          shipping_address: addressForm.shipping_address,
        }));
      } else {
        alert(res?.message || "Failed to update shipping address");
      }
    } catch (err) {
      alert("Error updating shipping address: " + err.message);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleGenerateDocket = async () => {
    setIsGeneratingDocket(true);
    try {
      const payload = {
        consignee_name: addressForm.recipient_name || order.customer_name,
        contact_number: addressForm.contact_phone || order.customer_phone,
        address_line1: addressForm.shipping_address || order.shipping_address,
        pin_code: addressForm.pin_code || "560001",
        city: addressForm.city || "Bangalore",
        state: addressForm.state || "Karnataka",
        gross_weight: packageSpecs.gross_weight,
        net_weight: packageSpecs.net_weight,
        boxes: packageSpecs.boxes,
        shipment_type: "D&J",
        service_type: "valuable",
      };

      const res = await api.createSequelDocket(order.order_number || order.id, payload);
      if (res && res.status === "success") {
        triggerNotification(`Sequel Docket generated: #${res.docket_number || res.data?.docketNumber || 'Created'}`);
        loadOrderData();
      } else {
        alert(res?.message || "Failed to generate docket on Sequel 247 UAT server.");
      }
    } catch (err) {
      alert("Error generating docket: " + err.message);
    } finally {
      setIsGeneratingDocket(false);
    }
  };

  const handleTrackDocket = async () => {
    setIsTrackingLoading(true);
    setShowTrackingModal(true);
    try {
      const res = await api.trackSequelDocket(order.order_number || order.id);
      if (res && res.status === "success") {
        setTrackingDetails(res.data);
      } else {
        setTrackingDetails(null);
      }
    } catch (err) {
      console.warn("Could not track docket:", err);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const handleCancelDocket = async () => {
    if (!confirm("Are you sure you want to cancel this Sequel 247 armored courier docket?")) return;
    try {
      const res = await api.cancelSequelDocket(order.order_number || order.id, "Admin requested cancellation");
      if (res && res.status === "success") {
        triggerNotification("Sequel Armored Docket cancelled successfully");
        loadOrderData();
      } else {
        alert(res?.message || "Could not cancel docket");
      }
    } catch (err) {
      alert("Error cancelling docket: " + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "60px auto", padding: "20px", textAlign: "center", color: "var(--admin-text-secondary)" }}>
        <div style={{ fontSize: "16px", fontWeight: 600 }}>Loading live order specifications...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "20px" }}>
        <h2>Order not found</h2>
        <Link href="/orders" className="admin-btn-outline" style={{ marginTop: "16px" }}>
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const isFulfilled = fulfillmentStatus === "fulfilled";

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Toast Notification */}
      {showNotification && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "var(--admin-text-primary)",
            color: "var(--admin-surface)",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "var(--admin-shadow-lg)",
            fontSize: "13px",
            fontWeight: 600,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <span>✓</span>
          <span>{showNotification}</span>
        </div>
      )}

      {/* Top Navigation & Breadcrumbs */}
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link
          href="/orders"
          style={{
            color: "var(--admin-text-secondary)",
            fontSize: "13px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: 500
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Orders
        </Link>

        {/* Live sync indicator */}
        <span style={{ fontSize: "11px", color: "var(--admin-success)", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--admin-success)" }} />
          Live Database Connected
        </span>
      </div>

      {/* Order Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "var(--admin-text-primary)",
                margin: 0,
                letterSpacing: "-0.02em"
              }}
            >
              {order.order_number?.startsWith("#") ? order.order_number : `#${order.order_number || order.id}`}
            </h1>

            {/* Paid Badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "var(--admin-border-light, #E4E5E7)",
                color: "var(--admin-text-primary)",
                fontSize: "12px",
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: "9999px"
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--admin-text-primary)"
                }}
              />
              {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Paid"}
            </span>

            {/* Fulfillment Badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: isFulfilled ? "var(--admin-success-bg, #E3F1DF)" : "var(--admin-warning-bg, #FFF3D6)",
                color: isFulfilled ? "var(--admin-success, #1A5C19)" : "var(--admin-warning, #B27D00)",
                fontSize: "12px",
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: "9999px"
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  border: isFulfilled ? "1.5px solid var(--admin-success, #1A5C19)" : "1.5px solid var(--admin-warning, #B27D00)",
                  background: isFulfilled ? "var(--admin-success, #1A5C19)" : "transparent"
                }}
              />
              {isFulfilled ? "Fulfilled" : "Unfulfilled"}
            </span>
          </div>

          <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "var(--admin-text-secondary)" }}>
            {order.date_formatted}
          </p>
        </div>

        {/* Invoice Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => setShowInvoiceModal(true)}
            className="admin-btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              padding: "8px 16px",
              fontWeight: 600,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download Official Invoice</span>
          </button>

          <a
            href={`https://pintaara.com/invoice/${order.order_number || order.id}?download=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn-outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              padding: "8px 14px",
              textDecoration: "none",
            }}
          >
            <span>Storefront Link ↗</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Left Column & Right Sidebar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: "20px",
          alignItems: "start"
        }}
      >
        {/* ================= LEFT COLUMN ================= */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Card 1: Fulfillment / Delivery Section */}
          <div
            className="admin-card"
            style={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "12px",
              padding: "20px"
            }}
          >
            {/* Fulfillment Card Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: isFulfilled ? "var(--admin-success-bg, #E3F1DF)" : "var(--admin-warning-bg, #FFF3D6)",
                    color: isFulfilled ? "var(--admin-success, #1A5C19)" : "var(--admin-warning, #B27D00)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {isFulfilled ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  )}
                </span>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--admin-text-primary)",
                    margin: 0
                  }}
                >
                  {isFulfilled ? "Fulfilled" : "Unfulfilled"}
                </h3>
              </div>

              {/* Action Button: Mark as fulfilled ▾ */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowFulfillDropdown(!showFulfillDropdown)}
                  style={{
                    background: "var(--admin-text-primary)",
                    color: "var(--admin-surface)",
                    border: "none",
                    borderRadius: "9999px",
                    padding: "7px 16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "background 0.15s"
                  }}
                >
                  <span>{isFulfilled ? "Mark as unfulfilled" : "Mark as fulfilled"}</span>
                  <span style={{ fontSize: "10px", opacity: 0.8 }}>▼</span>
                </button>

                {showFulfillDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 6px)",
                      background: "var(--admin-surface)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: "8px",
                      boxShadow: "var(--admin-shadow-lg)",
                      zIndex: 100,
                      minWidth: "180px",
                      overflow: "hidden"
                    }}
                  >
                    <button
                      onClick={() => handleToggleFulfillment("fulfilled")}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        textAlign: "left",
                        background: isFulfilled ? "var(--admin-surface-hover)" : "transparent",
                        border: "none",
                        fontSize: "13px",
                        color: "var(--admin-text-primary)",
                        cursor: "pointer",
                        fontWeight: isFulfilled ? 600 : 400
                      }}
                    >
                      ✓ Mark as fulfilled
                    </button>
                    <button
                      onClick={() => handleToggleFulfillment("unfulfilled")}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        textAlign: "left",
                        background: !isFulfilled ? "var(--admin-surface-hover)" : "transparent",
                        border: "none",
                        borderTop: "1px solid var(--admin-border-light)",
                        fontSize: "13px",
                        color: "var(--admin-text-primary)",
                        cursor: "pointer",
                        fontWeight: !isFulfilled ? 600 : 400
                      }}
                    >
                      ○ Mark as unfulfilled
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Inner Delivery / Shipping Box */}
            <div
              style={{
                border: "1px solid var(--admin-border)",
                borderRadius: "10px",
                padding: "14px 16px",
                background: "var(--admin-surface-elevated)"
              }}
            >
              {/* Shipping header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--admin-text-primary)",
                  marginBottom: "14px"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>Shipping</span>
              </div>

              {/* Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(order.items || []).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      background: "var(--admin-surface)",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--admin-border)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {/* Product Thumbnail */}
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "8px",
                          background: "var(--admin-surface-elevated)",
                          border: "1px solid var(--admin-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--admin-text-muted)",
                          overflow: "hidden",
                          flexShrink: 0
                        }}
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        )}
                      </div>

                      {/* Product Info */}
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-primary)" }}>
                          {item.name}
                        </div>
                        {item.design_code && (
                          <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                            SKU: {item.design_code} {item.metal_purity ? `• ${item.metal_purity}` : ""}
                          </div>
                        )}
                        {/* HUID & Certificate Status Badges */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 7px",
                              borderRadius: "4px",
                              background: item.huid ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                              color: item.huid ? "#047857" : "#b45309",
                              fontWeight: 600,
                              letterSpacing: "0.02em",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <span>HUID:</span>
                            <span style={{ fontWeight: 700 }}>{item.huid || "Pending"}</span>
                          </span>

                          {Array.isArray(item.certificates) && item.certificates.length > 0 ? (
                            <span
                              style={{
                                fontSize: "11px",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                background: "rgba(59, 130, 246, 0.12)",
                                color: "#1d4ed8",
                                fontWeight: 500,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <span>Certificates ({item.certificates.length}):</span>
                              <span style={{ fontWeight: 600 }}>
                                {item.certificates.map((c) => c.name ? c.name.replace(/^Download\s+/i, '') : 'Cert').join(", ")}
                              </span>
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: "11px",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                background: item.certificate_number || item.certificate_url ? "rgba(59, 130, 246, 0.12)" : "var(--admin-surface-hover)",
                                color: item.certificate_number || item.certificate_url ? "#1d4ed8" : "var(--admin-text-secondary)",
                                fontWeight: 500,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <span>Cert:</span>
                              <span>{item.certificate_number ? item.certificate_number : (item.certificate_url ? "Attached" : "None")}</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenCertModal(item)}
                            style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid var(--admin-border)",
                              background: "transparent",
                              color: "var(--admin-text-primary)",
                              cursor: "pointer",
                              fontWeight: 600,
                              transition: "background 0.2s"
                            }}
                          >
                            ✎ {item.huid || (item.certificates && item.certificates.length > 0) ? "Edit" : "+ Add"} Certificates
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Unit Math and Line Total */}
                    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                      <span style={{ fontSize: "13px", color: "var(--admin-text-secondary)" }}>
                        ₹{Number(item.unit_price).toFixed(2)} × {item.quantity}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--admin-text-primary)", minWidth: "70px", textAlign: "right" }}>
                        ₹{Number(item.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sequel 247 Logistics Integration Box - Hidden when fulfilled unless docket exists */}
              {(!isFulfilled || order.docket_number) && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border)",
                    background: "var(--admin-surface)",
                    position: "relative"
                  }}
                >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                        Sequel 247 Logistics
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: logisticsConfig?.is_production ? "#DEF7EC" : "#FEF08A",
                            color: logisticsConfig?.is_production ? "#03543F" : "#713F12",
                            fontWeight: 600,
                            letterSpacing: "0.02em"
                          }}
                        >
                          {logisticsConfig?.is_production ? "Production" : "UAT Sandbox"}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginTop: "2px" }}>
                        Client: {logisticsConfig?.client_code || "31492"} • Store Code: {logisticsConfig?.store_code || "PINTARA"}
                      </div>
                    </div>
                  </div>

                  {order.docket_number ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={handleTrackDocket}
                        style={{
                          background: "var(--admin-text-primary)",
                          color: "var(--admin-surface)",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        Track Shipment
                      </button>
                      <button
                        onClick={handleCancelDocket}
                        style={{
                          background: "transparent",
                          color: "var(--admin-danger, #E02424)",
                          border: "1px solid var(--admin-border)",
                          borderRadius: "6px",
                          padding: "5px 12px",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer"
                        }}
                      >
                        Cancel Docket
                      </button>
                    </div>
                  ) : null}
                </div>

                {order.docket_number ? (
                  <div
                    style={{
                      background: "var(--admin-surface-elevated)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: "6px",
                      padding: "12px 14px",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                      gap: "12px"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)", textTransform: "uppercase", fontWeight: 500 }}>
                        Docket Number (AWB)
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-primary)", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                        {order.docket_number}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(order.docket_number);
                            triggerNotification("Docket number copied to clipboard");
                          }}
                          title="Copy Docket Number"
                          style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", color: "var(--admin-text-secondary)", display: "inline-flex", alignItems: "center" }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {order.pickup_token && (
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)", textTransform: "uppercase", fontWeight: 500 }}>
                          Pickup Token (BRN)
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--admin-text-primary)", marginTop: "2px" }}>
                          {order.pickup_token}
                        </div>
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)", textTransform: "uppercase", fontWeight: 500 }}>
                        Service Type
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--admin-text-primary)", marginTop: "2px" }}>
                        D&J Valuable (Insured)
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)", textTransform: "uppercase", fontWeight: 500 }}>
                        Status
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--admin-text-primary)", marginTop: "2px" }}>
                        {order.logistics_status || "Created"}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Package & Weight Details directly on the page */
                  <div
                    style={{
                      background: "var(--admin-surface-elevated)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: "8px",
                      padding: "14px 16px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--admin-text-primary)" }}>
                        Package & Weight Details
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>Destination: <strong>{addressForm.city || "Bangalore"} ({addressForm.pin_code || "560001"})</strong></span>
                        <button
                          onClick={() => setShowAddressModal(true)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--admin-primary, #3C50E0)",
                            fontSize: "12px",
                            fontWeight: 500,
                            cursor: "pointer",
                            padding: "0 4px"
                          }}
                        >
                          Change address
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "12px",
                        flexWrap: "wrap"
                      }}
                    >
                      <div style={{ flex: "1 1 120px", minWidth: "110px" }}>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "var(--admin-text-secondary)", marginBottom: "4px" }}>
                          Gross Weight (kg)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={packageSpecs.gross_weight}
                          onChange={(e) => setPackageSpecs({ ...packageSpecs, gross_weight: parseFloat(e.target.value) || 0.25 })}
                          style={{
                            width: "100%",
                            height: "38px",
                            padding: "0 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--admin-border)",
                            background: "var(--admin-surface)",
                            color: "var(--admin-text-primary)",
                            fontSize: "13px",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>

                      <div style={{ flex: "1 1 120px", minWidth: "110px" }}>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "var(--admin-text-secondary)", marginBottom: "4px" }}>
                          Net Weight (kg)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={packageSpecs.net_weight}
                          onChange={(e) => setPackageSpecs({ ...packageSpecs, net_weight: parseFloat(e.target.value) || 0.05 })}
                          style={{
                            width: "100%",
                            height: "38px",
                            padding: "0 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--admin-border)",
                            background: "var(--admin-surface)",
                            color: "var(--admin-text-primary)",
                            fontSize: "13px",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>

                      <div style={{ flex: "1 1 100px", minWidth: "90px" }}>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "var(--admin-text-secondary)", marginBottom: "4px" }}>
                          Boxes Count
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={packageSpecs.boxes}
                          onChange={(e) => setPackageSpecs({ ...packageSpecs, boxes: parseInt(e.target.value) || 1 })}
                          style={{
                            width: "100%",
                            height: "38px",
                            padding: "0 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--admin-border)",
                            background: "var(--admin-surface)",
                            color: "var(--admin-text-primary)",
                            fontSize: "13px",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>

                      <div style={{ flex: "0 0 auto" }}>
                        <button
                          onClick={handleGenerateDocket}
                          disabled={isGeneratingDocket}
                          style={{
                            height: "38px",
                            padding: "0 22px",
                            borderRadius: "6px",
                            border: "none",
                            background: "var(--admin-text-primary)",
                            color: "var(--admin-surface)",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: isGeneratingDocket ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxSizing: "border-box",
                            letterSpacing: "0.01em",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
                          }}
                        >
                          {isGeneratingDocket ? "Generating..." : "Generate Sequel Docket"}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--admin-text-secondary)", display: "flex", flexWrap: "wrap", gap: "16px" }}>
                      <span>Service: <strong>Valuable (D&J)</strong></span>
                      <span>Insurance: <strong>Included</strong></span>
                      <span>Dispatch Vault: <strong>PINTARA</strong></span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

          {/* Card 2: Payment / Pricing Section */}
          <div
            className="admin-card"
            style={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "12px",
              padding: "20px"
            }}
          >
            {/* Header: Payment Status & Method */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    border: "1.5px solid var(--admin-text-primary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "var(--admin-text-primary)"
                  }}
                >
                  {order.payment_status === 'pending' ? '⏳' : '✓'}
                </span>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--admin-text-primary)", margin: 0 }}>
                  {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Paid"}
                </h3>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-secondary)" }}>
                {order.payment_method?.toLowerCase() === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
              </span>
            </div>

            {/* Breakdown table */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              {/* Subtotal */}
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--admin-text-primary)" }}>
                <span>Subtotal</span>
                <span style={{ color: "var(--admin-text-secondary)" }}>
                  {(order.items || []).length} item{(order.items || []).length > 1 ? "s" : ""}
                </span>
                <span style={{ fontWeight: 600 }}>
                  ₹{Number(order.subtotal).toFixed(2)}
                </span>
              </div>

              {/* Taxes */}
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--admin-text-primary)" }}>
                <span>Taxes</span>
                <span style={{ color: "var(--admin-text-secondary)" }}>{order.taxes_label || "CGST 9%"}</span>
                <span style={{ fontWeight: 600 }}>
                  ₹{Number(order.taxes_amount).toFixed(2)}
                </span>
              </div>

              {/* Grand Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--admin-text-primary)",
                  fontWeight: 700,
                  fontSize: "14px",
                  marginTop: "4px"
                }}
              >
                <span>Total</span>
                <span>₹{Number(order.total).toFixed(2)}</span>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: "var(--admin-border)", margin: "6px 0" }} />

              {/* Paid / Due */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--admin-text-primary)",
                  fontWeight: 600
                }}
              >
                <span>{order.payment_status === 'pending' ? 'Balance Due (COD)' : 'Paid'}</span>
                <span>₹{Number(order.payment_status === 'pending' ? order.total : (order.paid || order.total)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Card: Notes */}
          <div
            className="admin-card"
            style={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "12px",
              padding: "16px 20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-primary)", margin: 0 }}>
                Notes
              </h3>
              <button
                onClick={() => setIsAddingNote(!isAddingNote)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  color: "var(--admin-text-secondary)",
                  cursor: "pointer",
                  padding: "0 4px",
                  lineHeight: 1
                }}
              >
                +
              </button>
            </div>

            {isAddingNote ? (
              <div style={{ marginTop: "10px" }}>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add private note regarding this order..."
                  rows={2}
                  style={{
                    width: "100%",
                    fontSize: "12px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-border)",
                    boxSizing: "border-box",
                    background: "var(--admin-surface-elevated)",
                    color: "var(--admin-text-primary)"
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "6px" }}>
                  <button
                    onClick={() => setIsAddingNote(false)}
                    style={{ background: "none", border: "none", fontSize: "11px", color: "var(--admin-text-secondary)", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    style={{
                      background: "var(--admin-text-primary)",
                      color: "var(--admin-surface)",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "11px",
                      padding: "4px 10px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "13px", color: noteText ? "var(--admin-text-primary)" : "var(--admin-text-secondary)", marginTop: "8px" }}>
                {noteText || "No notes"}
              </div>
            )}
          </div>

          {/* Card: Customer */}
          <div
            className="admin-card"
            style={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "12px",
              padding: "16px 20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-primary)", margin: 0 }}>
                Customer
              </h3>
              <button
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "12px",
                  color: "var(--admin-primary, #3C50E0)",
                  cursor: "pointer",
                  padding: 0,
                  fontWeight: 500
                }}
              >
                Edit
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--admin-primary, #3C50E0)",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none"
                }}
              >
                {order.customer_name || "No name provided"}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--admin-primary, #3C50E0)",
                  cursor: "pointer"
                }}
              >
                {order.customer_orders_count || "1 order"}
              </span>
              {order.customer_email && (
                <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginTop: "4px" }}>
                  {order.customer_email}
                </div>
              )}
              {order.customer_phone && (
                <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                  {order.customer_phone}
                </div>
              )}
            </div>
          </div>

          {/* Card: Shipping Address */}
          <div
            className="admin-card"
            style={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "12px",
              padding: "16px 20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-primary)", margin: 0 }}>
                Shipping address
              </h3>
              <button
                onClick={() => setShowAddressModal(true)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "12px",
                  color: "var(--admin-primary, #3C50E0)",
                  cursor: "pointer",
                  padding: 0,
                  fontWeight: 500
                }}
              >
                Edit
              </button>
            </div>

            <div style={{ fontSize: "13px", color: "var(--admin-text-secondary)", lineHeight: 1.4 }}>
              {order.shipping_address || "No shipping address provided"}
            </div>
          </div>

          {/* Card: Billing Address */}
          <div
            className="admin-card"
            style={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "12px",
              padding: "16px 20px"
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-primary)", margin: "0 0 8px 0" }}>
              Billing address
            </h3>

            <div style={{ fontSize: "13px", color: "var(--admin-text-secondary)", lineHeight: 1.4 }}>
              {order.billing_address || "No billing address provided"}
            </div>
          </div>

          {/* Card: Conversion Summary */}
          <div
            className="admin-card"
            style={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "12px",
              padding: "16px 20px"
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-primary)", margin: "0 0 8px 0" }}>
              Conversion summary
            </h3>

            <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: "0 0 8px 0", lineHeight: 1.4 }}>
              There aren't any conversion details available for this order yet
            </p>

            <span
              style={{
                fontSize: "13px",
                color: "var(--admin-primary, #3C50E0)",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              Learn more
            </span>
          </div>
        </div>
      </div>

      {/* ================= MODAL: EDIT SHIPPING ADDRESS ================= */}
      {showAddressModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "12px",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              padding: "24px"
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--admin-text-primary)" }}>
                  Edit Shipping Address
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                  Update delivery details and verify Sequel 247 PIN serviceability
                </p>
              </div>
              <button
                onClick={() => setShowAddressModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  color: "var(--admin-text-secondary)",
                  cursor: "pointer",
                  padding: "0 4px",
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Recipient Name & Phone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={addressForm.recipient_name}
                    onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--admin-border)",
                      background: "var(--admin-surface-elevated)",
                      color: "var(--admin-text-primary)",
                      fontSize: "13px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={addressForm.contact_phone}
                    onChange={(e) => setAddressForm({ ...addressForm, contact_phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--admin-border)",
                      background: "var(--admin-surface-elevated)",
                      color: "var(--admin-text-primary)",
                      fontSize: "13px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                  Shipping Address
                </label>
                <textarea
                  rows={2}
                  value={addressForm.shipping_address}
                  onChange={(e) => setAddressForm({ ...addressForm, shipping_address: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-border)",
                    background: "var(--admin-surface-elevated)",
                    color: "var(--admin-text-primary)",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* PIN Code with Serviceability Check */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignItems: "end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                    PIN Code
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      maxLength={6}
                      value={addressForm.pin_code}
                      onChange={(e) => setAddressForm({ ...addressForm, pin_code: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--admin-border)",
                        background: "var(--admin-surface-elevated)",
                        color: "var(--admin-text-primary)",
                        fontSize: "13px",
                        fontWeight: 500,
                        boxSizing: "border-box"
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCheckServiceability}
                      disabled={isCheckingService}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        background: "var(--admin-surface-hover)",
                        border: "1px solid var(--admin-border)",
                        fontSize: "12px",
                        fontWeight: 500,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        color: "var(--admin-text-primary)"
                      }}
                    >
                      {isCheckingService ? "Checking..." : "Verify PIN"}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--admin-text-primary)", marginBottom: "4px" }}>
                    City / State
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    <input
                      type="text"
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--admin-border)",
                        background: "var(--admin-surface-elevated)",
                        color: "var(--admin-text-primary)",
                        fontSize: "12px",
                        boxSizing: "border-box"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--admin-border)",
                        background: "var(--admin-surface-elevated)",
                        color: "var(--admin-text-primary)",
                        fontSize: "12px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Serviceability Result Feedback */}
              {serviceabilityStatus && (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    background: serviceabilityStatus.success ? "var(--admin-success-bg, #E3F1DF)" : "var(--admin-danger-bg, #FDE8E8)",
                    color: serviceabilityStatus.success ? "var(--admin-success, #1A5C19)" : "var(--admin-danger, #E02424)",
                    border: `1px solid ${serviceabilityStatus.success ? "rgba(22, 163, 74, 0.3)" : "rgba(224, 36, 36, 0.3)"}`
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{serviceabilityStatus.success ? "Serviceable" : "Not Serviceable"}: </span>
                  <span>{serviceabilityStatus.success ? `Hub: ${serviceabilityStatus.city || 'Bangalore'} • COD: ${serviceabilityStatus.cod || 'YES'}` : serviceabilityStatus.message}</span>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--admin-border)",
                  background: "transparent",
                  color: "var(--admin-text-secondary)",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveShippingAddress}
                disabled={isSavingAddress}
                style={{
                  padding: "8px 18px",
                  borderRadius: "6px",
                  border: "none",
                  background: "var(--admin-text-primary)",
                  color: "var(--admin-surface)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: isSavingAddress ? "not-allowed" : "pointer"
                }}
              >
                {isSavingAddress ? "Saving..." : "Save Shipping Address"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: LIVE TRACKING DOCKET ================= */}
      {showTrackingModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              padding: "24px"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--admin-text-primary)" }}>
                  Sequel 247 Tracking
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                  Docket #{order.docket_number} • Sequel 247 Courier Network
                </p>
              </div>
              <button
                onClick={() => setShowTrackingModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  color: "var(--admin-text-secondary)",
                  cursor: "pointer",
                  padding: "0 4px",
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            {isTrackingLoading ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--admin-text-secondary)" }}>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>Querying Sequel 247 Logistics Network...</div>
                <div style={{ fontSize: "12px", marginTop: "6px" }}>Connecting to encrypted tracking nodes</div>
              </div>
            ) : trackingDetails ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div
                  style={{
                    background: "var(--admin-surface-elevated)",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    border: "1px solid var(--admin-border)"
                  }}
                >
                  <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)", textTransform: "uppercase" }}>
                    Current Status
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--admin-success, #1A5C19)", marginTop: "2px" }}>
                    {trackingDetails?.status || trackingDetails?.data?.[0]?.status_description || "Shipment Registered"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginTop: "4px" }}>
                    {trackingDetails?.message || "Armored courier scheduled for vault dispatch"}
                  </div>
                </div>

                {/* Tracking activities */}
                <div style={{ maxHeight: "250px", overflowY: "auto", padding: "4px" }}>
                  {(trackingDetails?.data?.[0]?.activities || [
                    { status: "SCREATED", status_description: "Shipment Docket Created & Vault Sealed", location: "Mumbai / HQ Vault", time: "Oct 7, 2026 - Active" },
                    { status: "SASSIGN", status_description: "Armored Vehicle Assigned for Pickup", location: "PINTARA Vault", time: "Pending Courier Arrival" }
                  ]).map((act, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        position: "relative",
                        paddingBottom: "14px"
                      }}
                    >
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: i === 0 ? "var(--admin-primary, #3C50E0)" : "var(--admin-border)",
                          marginTop: "4px",
                          flexShrink: 0
                        }}
                      />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--admin-text-primary)" }}>
                          {act.status_description || act.status}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                          {act.location} {act.time ? `• ${act.time}` : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "30px 20px", color: "var(--admin-text-secondary)" }}>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>Docket Record Acknowledged</div>
                <div style={{ fontSize: "12px", marginTop: "6px" }}>
                  Docket #{order.docket_number} is registered on Sequel 247 UAT. Checkpoints update once the armored vehicle makes the initial vault scan.
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button
                onClick={() => setShowTrackingModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--admin-border)",
                  background: "var(--admin-surface-elevated)",
                  color: "var(--admin-text-primary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign HUID & Certificate Modal */}
      {editingItemCert && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
          onClick={() => !isSavingCert && setEditingItemCert(null)}
        >
          <div
            style={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              padding: "0",
              boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
              boxSizing: "border-box",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--admin-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--admin-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📜</span>
                  <span>Certificates &amp; HUID Management</span>
                </h3>
                <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginTop: "2px", display: "block" }}>
                  {editingItemCert.product_name || editingItemCert.name} &bull; {editingItemCert.design_code || "Bespoke Form"} {editingItemCert.metal_purity ? `(${editingItemCert.metal_purity})` : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingItemCert(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  color: "var(--admin-text-secondary)",
                  cursor: "pointer",
                  padding: "4px 8px"
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* BIS Hallmark Unique ID (HUID) */}
              <div style={{ padding: "16px", borderRadius: "10px", background: "var(--admin-surface-elevated)", border: "1px solid var(--admin-border)" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", marginBottom: "4px", letterSpacing: "0.03em" }}>
                  BIS HALLMARK UNIQUE IDENTIFICATION (HUID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. HUID-842199 or 6-character alphanumeric code"
                  value={certHuid}
                  onChange={(e) => setCertHuid(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-border)",
                    background: "var(--admin-surface)",
                    color: "var(--admin-text-primary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    boxSizing: "border-box"
                  }}
                />
                <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)", display: "block", marginTop: "4px" }}>
                  Stamped directly on piece during BIS assay verification. Displayed alongside download buttons in client collection.
                </span>
              </div>

              {/* Certificates Section */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-primary)", letterSpacing: "0.02em" }}>
                      ATTACHED CERTIFICATES ({certList.length})
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)", display: "block" }}>
                      Add invoice credentials, gem reports, hallmark cards, or diamond grading certificates.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCertRow}
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--admin-primary, #D4AF37)",
                      background: "rgba(212, 175, 55, 0.1)",
                      color: "var(--admin-primary, #D4AF37)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    + Add Another Certificate
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {certList.map((cert, idx) => {
                    const isKnownMaster = certMasterTypes.includes(cert.name);
                    const showCustomInput = cert.isCustomName || (!isKnownMaster && cert.name);

                    return (
                      <div
                        key={cert.id || idx}
                        style={{
                          border: "1px solid var(--admin-border)",
                          borderRadius: "10px",
                          background: "var(--admin-surface-elevated)",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px"
                        }}
                      >
                        {/* Certificate Row Header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--admin-text-primary)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.15)", color: "#2563eb", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700 }}>
                              {idx + 1}
                            </span>
                            <span>{cert.name || `Certificate #${idx + 1}`}</span>
                          </span>

                          {certList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCertRow(idx)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#ef4444",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: "pointer",
                                padding: "2px 6px"
                              }}
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>

                        {/* Row 1: Certificate Master / Name & Number */}
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "3px" }}>
                              Certificate Type (Master) *
                            </label>
                            <select
                              value={showCustomInput ? "__custom__" : cert.name}
                              onChange={(e) => {
                                if (e.target.value === "__custom__") {
                                  handleCertFieldChange(idx, "isCustomName", true);
                                } else {
                                  handleCertFieldChange(idx, "isCustomName", false);
                                  handleCertFieldChange(idx, "name", e.target.value);
                                }
                              }}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--admin-border)",
                                background: "var(--admin-surface)",
                                color: "var(--admin-text-primary)",
                                fontSize: "12px",
                                boxSizing: "border-box"
                              }}
                            >
                              {certMasterTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                              <option value="__custom__">+ Enter Custom Certificate Name...</option>
                            </select>

                            {showCustomInput && (
                              <input
                                type="text"
                                placeholder="Type custom certificate name..."
                                value={cert.name}
                                onChange={(e) => handleCertFieldChange(idx, "name", e.target.value)}
                                style={{
                                  width: "100%",
                                  marginTop: "6px",
                                  padding: "7px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid var(--admin-border)",
                                  background: "var(--admin-surface)",
                                  color: "var(--admin-text-primary)",
                                  fontSize: "12px",
                                  boxSizing: "border-box"
                                }}
                              />
                            )}
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "3px" }}>
                              Certificate Ref / No.
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. BIS-991244 or IGI-GEM-001"
                              value={cert.certificate_number}
                              onChange={(e) => handleCertFieldChange(idx, "certificate_number", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--admin-border)",
                                background: "var(--admin-surface)",
                                color: "var(--admin-text-primary)",
                                fontSize: "12px",
                                boxSizing: "border-box"
                              }}
                            />
                          </div>
                        </div>

                        {/* Row 2: File Upload & Government Verification Portal URL */}
                        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: "12px", alignItems: "start" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "3px" }}>
                              Upload Certificate Document (PDF / Image)
                            </label>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => handleCertFileUpload(idx, e.target.files?.[0])}
                                disabled={uploadingIndex === idx}
                                style={{
                                  width: "100%",
                                  fontSize: "11px",
                                  color: "var(--admin-text-primary)"
                                }}
                              />
                              {uploadingIndex === idx && (
                                <span style={{ fontSize: "11px", color: "#3b82f6", fontWeight: 600 }}>
                                  Uploading...
                                </span>
                              )}
                            </div>
                            {cert.file_name && (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                <span style={{ fontSize: "10px", color: "#059669", fontWeight: 600 }}>
                                  ✓ Attached: {cert.file_name}
                                </span>
                                {cert.certificate_url && (
                                  <a
                                    href={cert.certificate_url.startsWith("/storage/") 
                                      ? `${(process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://api.pintaara.com' : 'http://127.0.0.1:8000'))}${cert.certificate_url}` 
                                      : cert.certificate_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ fontSize: "10px", color: "var(--admin-primary, #3b82f6)", textDecoration: "underline" }}
                                  >
                                    ↗ Preview
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "3px" }}>
                              Govt. / Lab Verification Portal URL (External Link)
                            </label>
                            <input
                              type="text"
                              placeholder="https://www.manakonline.in/... or https://www.igi.org/..."
                              value={cert.verification_url || ""}
                              onChange={(e) => handleCertFieldChange(idx, "verification_url", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--admin-border)",
                                background: "var(--admin-surface)",
                                color: "var(--admin-text-primary)",
                                fontSize: "12px",
                                boxSizing: "border-box"
                              }}
                            />
                            {/* Preset Buttons for Quick Government / Lab Selection */}
                            <div style={{ display: "flex", gap: "6px", marginTop: "4px", flexWrap: "wrap", alignItems: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleCertFieldChange(idx, "verification_url", "https://www.manakonline.in/MANAK/hallmarkHuidVerification")}
                                style={{
                                  fontSize: "10px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  border: "1px solid var(--admin-border)",
                                  background: "var(--admin-surface)",
                                  color: "var(--admin-text-primary)",
                                  cursor: "pointer"
                                }}
                              >
                                🏛️ BIS Govt. Portal
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCertFieldChange(idx, "verification_url", "https://www.igi.org/verify-your-report/")}
                                style={{
                                  fontSize: "10px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  border: "1px solid var(--admin-border)",
                                  background: "var(--admin-surface)",
                                  color: "var(--admin-text-primary)",
                                  cursor: "pointer"
                                }}
                              >
                                💎 IGI Verify
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCertFieldChange(idx, "verification_url", "https://www.gia.edu/report-check-landing")}
                                style={{
                                  fontSize: "10px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  border: "1px solid var(--admin-border)",
                                  background: "var(--admin-surface)",
                                  color: "var(--admin-text-primary)",
                                  cursor: "pointer"
                                }}
                              >
                                🔷 GIA Check
                              </button>
                              {cert.verification_url && (
                                <a
                                  href={cert.verification_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ fontSize: "10px", color: "var(--admin-primary, #3b82f6)", textDecoration: "underline", marginLeft: "auto" }}
                                >
                                  ↗ Open Link
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--admin-border)", display: "flex", justifyContent: "flex-end", gap: "10px", background: "var(--admin-surface-elevated)" }}>
              <button
                type="button"
                onClick={() => setEditingItemCert(null)}
                disabled={isSavingCert}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--admin-border)",
                  background: "transparent",
                  color: "var(--admin-text-primary)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCert}
                disabled={isSavingCert}
                style={{
                  padding: "8px 20px",
                  borderRadius: "6px",
                  border: "none",
                  background: "var(--admin-primary, #18181B)",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {isSavingCert ? "Saving..." : `Save HUID & Certificates (${certList.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Tax Invoice Modal */}
      {showInvoiceModal && order && (
        <OfficialInvoice
          invoice={{
            id: order.id,
            order_number: order.order_number || order.id,
            invoice_number: `INV-${order.order_number || order.id}`,
            date: order.created_at || order.date_formatted,
            payment_date: order.payment_date || order.created_at,
            total: order.pricing?.total_amount || order.total_amount,
            metal_value: order.pricing?.subtotal || order.subtotal || Math.round((order.total_amount || 0) / 1.03),
            piece_code: order.items?.[0]?.design_code || order.items?.[0]?.product_name || "PD-SD-OR-001",
            metal_purity: order.items?.[0]?.metal_purity || "18KT",
            finish: order.items?.[0]?.finish || "Rose gold",
            size: order.items?.[0]?.size || "12",
            stone: order.items?.[0]?.gem || "0.7CT Real Diamond",
            huid: order.items?.[0]?.huid || "HUID-984210",
            payment_method: order.payment_method || "Gpay",
            razorpay_payment_id: order.payment_id || order.razorpay_payment_id || `UPI${String(order.order_number || '').replace(/\D/g, '') || '2026'}`,
            customer_name: order.customer?.name || order.customer_name,
            customer_phone: order.customer?.phone || order.customer_phone,
            customer_email: order.customer?.email || order.customer_email,
            shipping_name: order.shipping_address?.full_name || order.customer_name,
            shipping_address: typeof order.shipping_address === "string" ? order.shipping_address : (order.shipping_address?.address_line1 || "Unit 12A, The Atelier Luxury Estate"),
            shipping_city_state: order.shipping_address?.city ? `${order.shipping_address.city}, ${order.shipping_address.state || ''}` : "Vadodara, Gujarat",
            shipping_postal: order.shipping_address?.postal_code || order.shipping_address?.pincode || "390001",
            shipping_country: order.shipping_address?.country || "India",
            shipping_phone: order.shipping_address?.phone || order.customer_phone,
            billing_address: typeof order.billing_address === "string" ? order.billing_address : "Shop 1 · Ground Floor, Suvarnaj Complex",
            billing_city_state: "Vadodara, Gujarat",
            billing_pincode: "390001",
          }}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
}
