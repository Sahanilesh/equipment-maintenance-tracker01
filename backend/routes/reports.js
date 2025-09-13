import express from 'express';
import Equipment from '../models/Equipment.js';
import WorkOrder from '../models/WorkOrder.js';
import User from '../models/User.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { generateEquipmentStatusPDF, generateWorkOrderSummaryPDF } from '../utils/pdfGenerator.js';

const router = express.Router();

// Equipment Status Report
router.get('/equipment-status', authenticateToken, async (req, res) => {
  try {
    const equipments = await Equipment.find();
    const pdf = await generateEquipmentStatusPDF(equipments);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=equipment-status-report.pdf');
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Work Order Summary Report
router.get('/work-order-summary', authenticateToken, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const workOrders = await WorkOrder.find(query)
      .populate('equipment', 'name type')
      .populate('assignedTechnician', 'name email');
      
    const pdf = await generateWorkOrderSummaryPDF(workOrders);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=work-order-summary-report.pdf');
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Technician Workload Report
router.get('/technician-workload', authenticateToken, async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' });
    const workloadData = [];
    
    for (const tech of technicians) {
      const workOrders = await WorkOrder.find({
        assignedTechnician: tech._id,
        status: { $in: ['pending', 'in-progress'] }
      }).populate('equipment', 'name');
      
      workloadData.push({
        technician: tech.name,
        activeWorkOrders: workOrders.length,
        workOrders: workOrders
      });
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .tech-section { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MechCorp Manufacturing</h1>
          <h2>Technician Workload Report</h2>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        ${workloadData.map(data => `
          <div class="tech-section">
            <h3>${data.technician} - Active Work Orders: ${data.activeWorkOrders}</h3>
            <table>
              <tr>
                <th>Title</th>
                <th>Equipment</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
              ${data.workOrders.map(wo => `
                <tr>
                  <td>${wo.title}</td>
                  <td>${wo.equipment?.name || 'N/A'}</td>
                  <td>${wo.status}</td>
                  <td>${new Date(wo.dueDate).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=technician-workload-report.pdf');
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;