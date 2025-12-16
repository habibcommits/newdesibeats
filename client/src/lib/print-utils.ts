import type { Order, Settings } from "@shared/schema";

export function formatPrice(price: number, currency: string = "Rs."): string {
  return `${currency} ${price.toLocaleString()}`;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getItemName(item: any): string {
  if (item?.productName && item.productName !== "") {
    return item.productName;
  }
  return "Item";
}

function getItemQuantity(item: any): number {
  if (typeof item?.quantity === "number" && !isNaN(item.quantity) && item.quantity > 0) {
    return item.quantity;
  }
  return 1;
}

function getItemPrice(item: any): number {
  if (typeof item?.price === "number" && !isNaN(item.price)) {
    return item.price;
  }
  return 0;
}

function generateReceiptCopy(
  order: Order,
  settings: Settings | null,
  currency: string,
  copyNumber: number
): string {
  const cafeName = settings?.cafeName || "Desi Beats Cafe";
  const cafeAddress = settings?.cafeAddress || "";
  const cafePhone = settings?.cafePhone || "";
  const taxPercentage = settings?.taxPercentage || 16;
  const footer = settings?.receiptFooter || "Thank you for your visit!";

  let itemsHtml = "";
  for (const item of order.items) {
    const name = getItemName(item);
    const qty = getItemQuantity(item);
    const price = getItemPrice(item);
    const variant = item.variant ? ` (${item.variant})` : "";
    const lineTotal = price * qty;

    itemsHtml += `
      <tr>
        <td class="qty">${qty}x</td>
        <td class="name">${name}${variant}</td>
        <td class="price">${formatPrice(lineTotal, currency)}</td>
      </tr>
    `;
    if (item.notes) {
      itemsHtml += `
        <tr>
          <td></td>
          <td colspan="2" class="note">Note: ${item.notes}</td>
        </tr>
      `;
    }
  }

  let paymentsHtml = "";
  if (order.payments && order.payments.length > 0) {
    paymentsHtml = `
      <div class="section-title">Payment</div>
      ${order.payments
        .map((p) => {
          const method = (p.method || "cash").toUpperCase().replace("_", " ");
          const tipText = p.tip > 0 ? ` (+${formatPrice(p.tip, currency)} tip)` : "";
          return `<div class="row"><span>${method}</span><span>${formatPrice(p.amount || 0, currency)}${tipText}</span></div>`;
        })
        .join("")}
      <div class="dashed-line"></div>
    `;
  }

  return `
    <div class="receipt-copy">
      <div class="copy-label">Copy ${copyNumber} of 2</div>
      
      <div class="header">
        <div class="cafe-name">${cafeName}</div>
        ${cafeAddress ? `<div class="cafe-info">${cafeAddress}</div>` : ""}
        ${cafePhone ? `<div class="cafe-info">Tel: ${cafePhone}</div>` : ""}
      </div>
      
      <div class="dashed-line"></div>
      
      <div class="order-info">
        <div class="row"><span>Order #:</span><span>${order.orderNumber}</span></div>
        <div class="row"><span>Date:</span><span>${formatDateTime(order.createdAt)}</span></div>
        ${order.tableName ? `<div class="row"><span>Table:</span><span>${order.tableName}</span></div>` : ""}
        <div class="row"><span>Type:</span><span>${order.type.charAt(0).toUpperCase() + order.type.slice(1)}</span></div>
        ${order.cashierName ? `<div class="row"><span>Cashier:</span><span>${order.cashierName}</span></div>` : ""}
      </div>
      
      <div class="dashed-line"></div>
      
      <div class="section-title">Items</div>
      <table class="items-table">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="dashed-line"></div>
      
      <div class="totals">
        <div class="row"><span>Subtotal:</span><span>${formatPrice(order.subtotal || 0, currency)}</span></div>
        <div class="row"><span>Tax (${taxPercentage}%):</span><span>${formatPrice(order.taxAmount || 0, currency)}</span></div>
      </div>
      
      <div class="dashed-line"></div>
      
      <div class="grand-total">
        <div class="row"><span>TOTAL:</span><span>${formatPrice(order.total || 0, currency)}</span></div>
      </div>
      
      <div class="dashed-line"></div>
      
      ${paymentsHtml}
      
      <div class="footer">
        <div>${footer}</div>
      </div>
    </div>
  `;
}

export function printReceipt(order: Order, settings: Settings | null, copies: number = 2): void {
  const currency = settings?.currency || "Rs.";

  const copy1 = generateReceiptCopy(order, settings, currency, 1);
  const copy2 = generateReceiptCopy(order, settings, currency, 2);

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt #${order.orderNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: 80mm auto;
          margin: 0;
        }
        
        body {
          font-family: 'Courier New', 'Consolas', monospace;
          font-size: 12px;
          line-height: 1.3;
          color: #000;
          background: #fff;
          width: 80mm;
          margin: 0 auto;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .receipt-copy {
          padding: 8px 5px;
        }
        
        .copy-label {
          text-align: center;
          font-size: 10px;
          font-weight: bold;
          margin-bottom: 8px;
          padding: 2px;
          background: #f0f0f0;
          border: 1px solid #ccc;
        }
        
        .header {
          text-align: center;
          margin-bottom: 8px;
        }
        
        .cafe-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .cafe-info {
          font-size: 11px;
          color: #333;
        }
        
        .dashed-line {
          border: none;
          border-top: 1px dashed #000;
          margin: 6px 0;
        }
        
        .order-info {
          margin: 6px 0;
        }
        
        .row {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;
        }
        
        .section-title {
          font-weight: bold;
          margin: 6px 0 4px 0;
          font-size: 12px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .items-table td {
          padding: 2px 0;
          vertical-align: top;
        }
        
        .items-table .qty {
          width: 25px;
          text-align: left;
        }
        
        .items-table .name {
          text-align: left;
        }
        
        .items-table .price {
          text-align: right;
          white-space: nowrap;
        }
        
        .items-table .note {
          font-size: 10px;
          font-style: italic;
          color: #555;
          padding-left: 10px;
        }
        
        .totals {
          margin: 6px 0;
        }
        
        .grand-total {
          font-size: 14px;
          font-weight: bold;
        }
        
        .footer {
          text-align: center;
          margin-top: 8px;
          font-size: 11px;
        }
        
        .cut-line {
          margin: 15px 0;
          text-align: center;
          position: relative;
        }
        
        .cut-line-dashes {
          border: none;
          border-top: 2px dashed #000;
          margin: 10px 0;
        }
        
        .scissors-icon {
          display: inline-block;
          font-size: 16px;
          margin: 0 5px;
        }
        
        .cut-text {
          font-size: 10px;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        
        @media print {
          body {
            width: 80mm;
            padding: 0;
            margin: 0;
          }
          
          .copy-label {
            background: #eee !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      ${copy1}
      
      <div class="cut-line">
        <div class="cut-text">
          <span class="scissors-icon">&#9986;</span>
          <span>- - - - - - - - - CUT HERE - - - - - - - - -</span>
          <span class="scissors-icon">&#9986;</span>
        </div>
        <div class="cut-line-dashes"></div>
      </div>
      
      ${copy2}
    </body>
    </html>
  `;

  const printFrame = document.createElement("iframe");
  printFrame.style.position = "fixed";
  printFrame.style.right = "0";
  printFrame.style.bottom = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "none";
  document.body.appendChild(printFrame);

  const printDocument = printFrame.contentDocument || printFrame.contentWindow?.document;
  if (!printDocument) {
    document.body.removeChild(printFrame);
    console.error("Could not open print dialog");
    return;
  }

  printDocument.open();
  printDocument.write(receiptHtml);
  printDocument.close();

  const triggerPrint = () => {
    try {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    } catch (e) {
      console.error("Print error:", e);
    }
    setTimeout(() => {
      if (document.body.contains(printFrame)) {
        document.body.removeChild(printFrame);
      }
    }, 1000);
  };

  if (printFrame.contentWindow) {
    printFrame.contentWindow.onload = triggerPrint;
    setTimeout(triggerPrint, 500);
  } else {
    triggerPrint();
  }
}
