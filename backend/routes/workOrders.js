import express from 'express';
import WorkOrder from '../models/WorkOrder.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get all work orders with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, technician } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (technician) query.assignedTechnician = technician;
    
    const workOrders = await WorkOrder.find(query)
      .populate('equipment', 'name type')
      .populate('assignedTechnician', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single work order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('equipment', 'name type')
      .populate('assignedTechnician', 'name email')
      .populate('createdBy', 'name email');
      
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create work order
router.post('/', authenticateToken, checkRole(['supervisor', 'manager']), async (req, res) => {
  try {
    const workOrder = new WorkOrder({
      ...req.body,
      createdBy: req.user._id
    });
    await workOrder.save();
    
    const populatedWorkOrder = await WorkOrder.findById(workOrder._id)
      .populate('equipment', 'name type')
      .populate('assignedTechnician', 'name email')
      .populate('createdBy', 'name email');
      
    res.status(201).json(populatedWorkOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update work order
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('equipment', 'name type')
      .populate('assignedTechnician', 'name email')
      .populate('createdBy', 'name email');
      
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete work order (Manager only)
router.delete('/:id', authenticateToken, checkRole(['manager']), async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndDelete(req.params.id);
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    res.json({ message: 'Work order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;