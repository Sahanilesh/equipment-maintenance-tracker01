import puppeteer from 'puppeteer';

export const generateEquipmentStatusPDF = async (equipments) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MechCorp Manufacturing</h1>
        <h2>Equipment Status Report</h2>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
      <table>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Status</th>
          <th>Last Maintenance</th>
          <th>Next Maintenance</th>
        </tr>
        ${equipments.map(eq => `
          <tr>
            <td>${eq.name}</td>
            <td>${eq.type}</td>
            <td>${eq.status}</td>
            <td>${eq.lastMaintenanceDate ? new Date(eq.lastMaintenanceDate).toLocaleDateString() : 'N/A'}</td>
            <td>${new Date(eq.nextMaintenanceDate).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdf;
};

export const generateWorkOrderSummaryPDF = async (workOrders) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MechCorp Manufacturing</h1>
        <h2>Work Order Summary Report</h2>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
      <table>
        <tr>
          <th>Title</th>
          <th>Equipment</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Assigned To</th>
          <th>Due Date</th>
        </tr>
        ${workOrders.map(wo => `
          <tr>
            <td>${wo.title}</td>
            <td>${wo.equipment?.name || 'N/A'}</td>
            <td>${wo.priority}</td>
            <td>${wo.status}</td>
            <td>${wo.assignedTechnician?.name || 'Unassigned'}</td>
            <td>${new Date(wo.dueDate).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdf;
};