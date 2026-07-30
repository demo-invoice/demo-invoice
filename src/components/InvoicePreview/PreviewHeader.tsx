import React from 'react';
import { tokens } from '../../tokens';
import { useInvoiceState } from '../../context/InvoiceContext';

/** Logo placeholder — always renders; never throws on empty logo field. */
function LogoPlaceholder(): React.JSX.Element {
  return (
    <div
      style={{
        width: '120px',
        height: '60px',
        backgroundColor: tokens.color.placeholder,
        borderRadius: tokens.radii.sm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: tokens.typography.size.sm,
        color: tokens.color.textMuted,
        fontWeight: tokens.typography.weight.medium,
        flexShrink: 0,
      }}
    >
      Logo
    </div>
  );
}

/**
 * Renders the top section of the invoice preview:
 * - Left: logo placeholder + sender details
 * - Right: INVOICE heading, number, issue date, due date
 */
export function PreviewHeader(): React.JSX.Element {
  const {
    invoiceNumber,
    issueDate,
    dueDate,
    senderName,
    senderEmail,
    senderPhone,
    senderAddress1,
    senderAddress2,
  } = useInvoiceState();

  const labelStyle: React.CSSProperties = {
    fontSize: tokens.typography.size.xs,
    color: tokens.color.textMuted,
    fontWeight: tokens.typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: tokens.spacing['1'],
  };

  const valueStyle: React.CSSProperties = {
    fontSize: tokens.typography.size.base,
    color: tokens.color.text,
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: tokens.spacing['8'],
        gap: tokens.spacing['4'],
      }}
    >
      {/* Left: logo + sender */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing['3'] }}>
        <LogoPlaceholder />
        <div
          style={{
            fontSize: tokens.typography.size.base,
            color: tokens.color.text,
            lineHeight: tokens.typography.lineHeight.normal,
          }}
        >
          {senderName && (
            <div style={{ fontWeight: tokens.typography.weight.semibold }}>{senderName}</div>
          )}
          {senderEmail && <div>{senderEmail}</div>}
          {senderPhone && <div>{senderPhone}</div>}
          {senderAddress1 && <div>{senderAddress1}</div>}
          {senderAddress2 && <div>{senderAddress2}</div>}
        </div>
      </div>

      {/* Right: INVOICE heading + meta */}
      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontSize: tokens.typography.size.xl,
            fontWeight: tokens.typography.weight.bold,
            color: tokens.color.accent,
            letterSpacing: '0.04em',
            marginBottom: tokens.spacing['4'],
          }}
        >
          INVOICE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing['1'] }}>
          <div>
            <span style={labelStyle}>Invoice #</span>
            <div style={valueStyle}>{invoiceNumber || '\u2014'}</div>
          </div>
          {issueDate && (
            <div style={{ marginTop: tokens.spacing['2'] }}>
              <span style={labelStyle}>Issue Date</span>
              <div style={valueStyle}>{issueDate}</div>
            </div>
          )}
          {dueDate && (
            <div style={{ marginTop: tokens.spacing['2'] }}>
              <span style={labelStyle}>Due Date</span>
              <div style={valueStyle}>{dueDate}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
