'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Rect,
} from '@react-pdf/renderer';
import { Invoice, BusinessProfile, Customer } from '@/types';
import { amountInWords } from '@/lib/number-to-words';

const THEME = {
  bg: '#0C0E12',
  metaBg: '#07090C',
  panelBg: '#101318',
  pillBg: '#1C222A',
  emeraldBoxBg: '#0D251C',
  emeraldBoxBorder: '#174B37',
  emeraldSoftBg: '#0A291E',
  emeraldSoftBorder: '#145A40',
  thankYouBg: '#092118',
  thankYouBorder: '#154C37',
  amberBg: '#2A1F0B',
  amberBorder: '#78350F',
  amberText: '#FBBF24',
  redBg: '#2C1014',
  redBorder: '#7F1D1D',
  redText: '#F87171',
  emerald: '#34D399',
  emeraldLight: '#A7F3D0',
  textPrimary: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  border: '#1B222C',
  borderSubtle: '#161C24',
  pillBorder: '#2D3744',
};

// Interpolated top bar stops: emerald-500 (#10B981) -> teal-500 (#14B8A6) -> amber-500 (#F59E0B)
const TOP_BAR_COLORS = [
  '#10B981', '#10B980', '#11B983', '#11B987', '#12B88C', '#12B892',
  '#13B898', '#13B89F', '#14B8A6', '#28B698', '#3FB489', '#56B27A',
  '#6DB06B', '#84AE5C', '#9BAC4E', '#B2AA3F', '#C9A730', '#DFA421',
  '#ED9F14', '#F59E0B',
];

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: THEME.textPrimary,
    backgroundColor: THEME.bg,
    paddingTop: 0,
    paddingBottom: 24,
    paddingHorizontal: 0,
  },
  topBarWrap: {
    width: '100%',
    height: 4,
  },
  body: {
    paddingTop: 26,
    paddingHorizontal: 34,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '58%',
  },
  brandIconBox: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: THEME.emeraldBoxBg,
    borderWidth: 1,
    borderColor: THEME.emeraldBoxBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandTextCol: {
    flexDirection: 'column',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  businessName: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: THEME.textPrimary,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 99,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.4,
  },
  businessType: {
    fontSize: 8.5,
    color: THEME.textMuted,
    marginTop: 2,
  },
  docSubtitle: {
    fontSize: 8.5,
    color: THEME.emerald,
    marginTop: 2.5,
  },
  metaCard: {
    backgroundColor: THEME.metaBg,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: 'flex-end',
    minWidth: 170,
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: THEME.textMuted,
    letterSpacing: 0.9,
    marginBottom: 3,
  },
  invoiceNumber: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  metaDateRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  metaDateKey: {
    fontSize: 8,
    color: THEME.textDim,
    marginRight: 6,
  },
  metaDateVal: {
    fontSize: 8,
    color: THEME.textSecondary,
  },
  partiesRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  partyLeft: {
    width: '50%',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: THEME.borderSubtle,
  },
  partyRight: {
    width: '50%',
    paddingLeft: 18,
  },
  partyEyebrow: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: THEME.textMuted,
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  partyName: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  gstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gstPrefix: {
    fontSize: 8,
    color: THEME.textMuted,
    marginRight: 5,
  },
  gstPill: {
    backgroundColor: THEME.pillBg,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gstPillText: {
    fontSize: 7.5,
    color: THEME.textSecondary,
  },
  partyAddress: {
    fontSize: 8,
    color: THEME.textMuted,
    lineHeight: 1.4,
  },
  tableWrap: {
    marginTop: 18,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  thText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: THEME.textMuted,
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 0.75,
    borderBottomColor: THEME.borderSubtle,
  },
  colIndex: { width: '6%' },
  colDesc: { width: '40%' },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '16%', textAlign: 'right' },
  colGst: { width: '12%', alignItems: 'center', justifyContent: 'center' },
  colTotal: { width: '16%', textAlign: 'right' },
  tdIndex: {
    fontSize: 8.5,
    color: THEME.textDim,
  },
  tdDesc: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: THEME.textPrimary,
    paddingRight: 8,
  },
  tdQty: {
    fontSize: 8.5,
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  tdPrice: {
    fontSize: 8.5,
    color: THEME.textSecondary,
    textAlign: 'right',
  },
  gstRatePill: {
    backgroundColor: THEME.pillBg,
    borderWidth: 0.75,
    borderColor: THEME.pillBorder,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gstRateText: {
    fontSize: 7.5,
    color: THEME.textSecondary,
  },
  tdTotal: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: THEME.textPrimary,
    textAlign: 'right',
  },
  bottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 22,
  },
  bottomLeft: {
    width: '49%',
  },
  paymentCard: {
    backgroundColor: THEME.panelBg,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 9,
    padding: 13,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },
  paymentTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: THEME.textSecondary,
    letterSpacing: 0.8,
  },
  verifiedPill: {
    borderRadius: 99,
    borderWidth: 0.75,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  verifiedText: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.6,
  },
  paymentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentMetaLabel: {
    fontSize: 7.5,
    color: THEME.textMuted,
    marginBottom: 2.5,
  },
  paymentMetaValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  paymentNote: {
    fontSize: 7.2,
    color: THEME.textMuted,
    lineHeight: 1.45,
  },
  thankYouBanner: {
    marginTop: 10,
    backgroundColor: THEME.thankYouBg,
    borderWidth: 1,
    borderColor: THEME.thankYouBorder,
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thankYouText: {
    marginLeft: 8,
    fontSize: 8,
    color: THEME.emeraldLight,
    flex: 1,
    lineHeight: 1.4,
  },
  thankYouBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  bottomRight: {
    width: '44%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6.5,
  },
  summaryLabel: {
    fontSize: 8.5,
    color: THEME.textMuted,
  },
  summaryValue: {
    fontSize: 8.5,
    color: THEME.textSecondary,
    textAlign: 'right',
  },
  discountValue: {
    fontSize: 8.5,
    color: THEME.redText,
    textAlign: 'right',
  },
  totalsDivider: {
    borderBottomWidth: 0.75,
    borderBottomColor: THEME.border,
    marginVertical: 8,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  grandTotalHint: {
    fontSize: 7.2,
    color: THEME.textMuted,
    marginTop: 2,
  },
  grandTotalAmount: {
    fontSize: 16.5,
    fontFamily: 'Helvetica-Bold',
    color: THEME.emerald,
    textAlign: 'right',
  },
  wordsBlock: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
  wordsEyebrow: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: THEME.textMuted,
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  wordsValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Oblique',
    color: THEME.textSecondary,
    textAlign: 'right',
    lineHeight: 1.35,
  },
  notesRow: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 0.75,
    borderTopColor: THEME.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notesCol: {
    width: '48%',
  },
  notesLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: THEME.textMuted,
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  notesText: {
    fontSize: 7.5,
    color: THEME.textMuted,
    lineHeight: 1.4,
  },
});

const money = (n: number) =>
  `Rs. ${(n ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function formatDisplayDate(raw?: string) {
  if (!raw) return 'N/A';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return String(raw);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return String(raw);
  }
}

function getStatusColors(status?: string) {
  const s = (status || 'unpaid').toLowerCase();
  if (s === 'paid') {
    return { bg: THEME.emeraldSoftBg, border: THEME.emeraldSoftBorder, text: THEME.emerald };
  }
  if (s === 'overdue') {
    return { bg: THEME.redBg, border: THEME.redBorder, text: THEME.redText };
  }
  return { bg: THEME.amberBg, border: THEME.amberBorder, text: THEME.amberText };
}

interface InvoicePDFProps {
  invoice: Invoice;
  businessProfile: BusinessProfile;
  customer?: Customer;
}

export const InvoicePDF = ({ invoice, businessProfile, customer }: InvoicePDFProps) => {
  const items = invoice.items || [];
  const subtotal = Number(invoice.subtotal) || 0;
  const gstTotal = Number(invoice.gst_total) || 0;
  const cgst = gstTotal / 2;
  const sgst = gstTotal / 2;
  const grandTotal = Number(invoice.grand_total) || 0;
  const discountVal = Number(invoice.discount_value) || 0;
  const discountAmount =
    discountVal > 0
      ? invoice.discount_type === 'percentage'
        ? ((subtotal + gstTotal) * discountVal) / 100
        : discountVal
      : 0;

  const effectiveGstPct = subtotal > 0 ? (gstTotal / subtotal) * 100 : 0;
  const halfGstLabel = (effectiveGstPct / 2).toFixed(1);
  const effectiveGstRounded = Math.round(effectiveGstPct);

  const cust = customer || invoice.customer;
  const statusStr = (invoice.status || 'unpaid').toLowerCase();
  const isPaid = statusStr === 'paid';
  const statusPalette = getStatusColors(statusStr);
  const businessName = businessProfile?.business_name || 'KrishiConnect Merchant';
  const paymentMode = (invoice.payment_method || 'UPI').toUpperCase();
  const barSegmentW = 595 / TOP_BAR_COLORS.length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Top Accent Gradient Bar */}
        <View style={styles.topBarWrap}>
          <Svg width="595" height="4" viewBox="0 0 595 4">
            {TOP_BAR_COLORS.map((hex, i) => (
              <Rect
                key={hex + i}
                x={i * barSegmentW}
                y={0}
                width={barSegmentW + 0.5}
                height={4}
                fill={hex}
              />
            ))}
          </Svg>
        </View>

        <View style={styles.body}>
          {/* Header Section */}
          <View style={styles.headerRow}>
            <View style={styles.brandWrap}>
              <View style={styles.brandIconBox}>
                <Svg width="20" height="20" viewBox="0 0 24 24">
                  <Path
                    d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                    stroke={THEME.emerald}
                    strokeWidth={1.8}
                    fill="none"
                  />
                  <Path d="M3 6h18" stroke={THEME.emerald} strokeWidth={1.8} fill="none" />
                  <Path d="M16 10a4 4 0 0 1-8 0" stroke={THEME.emerald} strokeWidth={1.8} fill="none" />
                </Svg>
              </View>
              <View style={styles.brandTextCol}>
                <View style={styles.brandTitleRow}>
                  <Text style={styles.businessName}>{businessName}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusPalette.bg,
                        borderColor: statusPalette.border,
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusPalette.text }]}>
                      {statusStr}
                    </Text>
                  </View>
                </View>
                <Text style={styles.businessType}>
                  {businessProfile?.business_type || 'Agricultural Producer'}
                </Text>
                <Text style={styles.docSubtitle}>Retail Tax Invoice</Text>
              </View>
            </View>

            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>INVOICE NUMBER</Text>
              <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
              <View style={styles.metaDateRow}>
                <Text style={styles.metaDateKey}>Issue Date:</Text>
                <Text style={styles.metaDateVal}>{formatDisplayDate(invoice.date)}</Text>
              </View>
              <View style={styles.metaDateRow}>
                <Text style={styles.metaDateKey}>Due Date:</Text>
                <Text style={styles.metaDateVal}>{formatDisplayDate(invoice.due_date)}</Text>
              </View>
            </View>
          </View>

          {/* Billed By / Billed To Section */}
          <View style={styles.partiesRow}>
            <View style={styles.partyLeft}>
              <Text style={styles.partyEyebrow}>BILLED BY (MERCHANT)</Text>
              <Text style={styles.partyName}>{businessName}</Text>
              <View style={styles.gstRow}>
                <Text style={styles.gstPrefix}>GSTIN:</Text>
                <View style={styles.gstPill}>
                  <Text style={styles.gstPillText}>
                    {businessProfile?.gst_number || 'N/A (Unregistered)'}
                  </Text>
                </View>
              </View>
              {!!businessProfile?.address && (
                <Text style={styles.partyAddress}>{businessProfile.address}</Text>
              )}
              {!!businessProfile?.phone && (
                <Text style={styles.partyAddress}>Ph: {businessProfile.phone}</Text>
              )}
            </View>

            <View style={styles.partyRight}>
              <Text style={styles.partyEyebrow}>BILLED TO (CUSTOMER)</Text>
              <Text style={styles.partyName}>{cust?.name || 'Walk-in Customer'}</Text>
              <View style={styles.gstRow}>
                <Text style={styles.gstPrefix}>GSTIN:</Text>
                <View style={styles.gstPill}>
                  <Text style={styles.gstPillText}>{cust?.gst_number || 'N/A'}</Text>
                </View>
              </View>
              {!!cust?.address && <Text style={styles.partyAddress}>{cust.address}</Text>}
              {!!cust?.phone && <Text style={styles.partyAddress}>Ph: {cust.phone}</Text>}
            </View>
          </View>

          {/* Line Items Table */}
          <View style={styles.tableWrap}>
            <View style={styles.tableHeader}>
              <Text style={[styles.thText, styles.colIndex]}>#</Text>
              <Text style={[styles.thText, styles.colDesc]}>DESCRIPTION</Text>
              <Text style={[styles.thText, styles.colQty]}>QTY</Text>
              <Text style={[styles.thText, styles.colPrice]}>PRICE</Text>
              <Text style={[styles.thText, styles.colGst, { textAlign: 'center' }]}>GST %</Text>
              <Text style={[styles.thText, styles.colTotal]}>TOTAL</Text>
            </View>

            {items.map((item, idx) => {
              const qty = Number(item.quantity) || 0;
              const unitPrice = Number(item.unit_price) || 0;
              const gstRate = Number(item.gst_rate) || 0;
              const baseAmt = qty * unitPrice;
              const rowTotal = baseAmt + baseAmt * (gstRate / 100);

              return (
                <View key={item.id || idx} style={styles.tableRow} wrap={false}>
                  <Text style={[styles.tdIndex, styles.colIndex]}>
                    {String(idx + 1).padStart(2, '0')}
                  </Text>
                  <Text style={[styles.tdDesc, styles.colDesc]}>{item.description}</Text>
                  <Text style={[styles.tdQty, styles.colQty]}>{qty}</Text>
                  <Text style={[styles.tdPrice, styles.colPrice]}>{money(unitPrice)}</Text>
                  <View style={styles.colGst}>
                    <View style={styles.gstRatePill}>
                      <Text style={styles.gstRateText}>{gstRate}%</Text>
                    </View>
                  </View>
                  <Text style={[styles.tdTotal, styles.colTotal]}>{money(rowTotal)}</Text>
                </View>
              );
            })}
          </View>

          {/* Bottom Split: Payment Details + Totals */}
          <View style={styles.bottomGrid} wrap={false}>
            {/* Left Column */}
            <View style={styles.bottomLeft}>
              <View style={styles.paymentCard}>
                <View style={styles.paymentCardHeader}>
                  <Text style={styles.paymentTitle}>PAYMENT DETAILS</Text>
                  <View
                    style={[
                      styles.verifiedPill,
                      {
                        backgroundColor: isPaid ? THEME.emeraldSoftBg : THEME.amberBg,
                        borderColor: isPaid ? THEME.emeraldSoftBorder : THEME.amberBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.verifiedText,
                        { color: isPaid ? THEME.emerald : THEME.amberText },
                      ]}
                    >
                      {isPaid ? 'VERIFIED' : 'PENDING'}
                    </Text>
                  </View>
                </View>

                <View style={styles.paymentMetaRow}>
                  <View>
                    <Text style={styles.paymentMetaLabel}>Payment Mode</Text>
                    <Text style={styles.paymentMetaValue}>{paymentMode}</Text>
                  </View>
                  <View>
                    <Text style={styles.paymentMetaLabel}>Transaction Status</Text>
                    <Text
                      style={[
                        styles.paymentMetaValue,
                        { color: isPaid ? THEME.emerald : THEME.amberText },
                      ]}
                    >
                      {isPaid ? 'Fully Settled' : 'Pending Balance'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.paymentNote}>
                  * Effective GST rate of {effectiveGstRounded}% includes CGST + SGST as
                  applicable.
                </Text>
              </View>

              <View style={styles.thankYouBanner}>
                <Svg width="14" height="14" viewBox="0 0 24 24">
                  <Path
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    stroke={THEME.emerald}
                    strokeWidth={1.8}
                    fill="none"
                  />
                </Svg>
                <Text style={styles.thankYouText}>
                  Thank you for shopping with{' '}
                  <Text style={styles.thankYouBold}>{businessName}</Text>!
                </Text>
              </View>
            </View>

            {/* Right Column */}
            <View style={styles.bottomRight}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal (Base Price)</Text>
                <Text style={styles.summaryValue}>{money(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>CGST ({halfGstLabel}%)</Text>
                <Text style={styles.summaryValue}>{money(cgst)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>SGST ({halfGstLabel}%)</Text>
                <Text style={styles.summaryValue}>{money(sgst)}</Text>
              </View>
              {discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Discount
                    {invoice.discount_type === 'percentage' ? ` (${discountVal}%)` : ''}
                  </Text>
                  <Text style={styles.discountValue}>-{money(discountAmount)}</Text>
                </View>
              )}

              <View style={styles.totalsDivider} />

              <View style={styles.grandTotalRow}>
                <View>
                  <Text style={styles.grandTotalTitle}>GRAND TOTAL</Text>
                  <Text style={styles.grandTotalHint}>Inclusive of all taxes</Text>
                </View>
                <Text style={styles.grandTotalAmount}>{money(grandTotal)}</Text>
              </View>

              <View style={styles.wordsBlock}>
                <Text style={styles.wordsEyebrow}>AMOUNT IN WORDS</Text>
                <Text style={styles.wordsValue}>{amountInWords(grandTotal)}</Text>
              </View>
            </View>
          </View>

          {/* Optional Notes / Terms Footer */}
          {(invoice.notes || invoice.terms) && (
            <View style={styles.notesRow} wrap={false}>
              {invoice.notes ? (
                <View style={styles.notesCol}>
                  <Text style={styles.notesLabel}>NOTES</Text>
                  <Text style={styles.notesText}>{invoice.notes}</Text>
                </View>
              ) : (
                <View style={styles.notesCol} />
              )}
              {invoice.terms ? (
                <View style={styles.notesCol}>
                  <Text style={styles.notesLabel}>TERMS & CONDITIONS</Text>
                  <Text style={styles.notesText}>{invoice.terms}</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
