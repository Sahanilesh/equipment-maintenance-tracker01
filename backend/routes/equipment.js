import express from 'express';
import Equipment from '../models/Equipment.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get all equipment
router.get('/', authenticateToken, async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single equipment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create equipment (Supervisor/Manager only)
router.post('/', authenticateToken, checkRole(['supervisor', 'manager']), async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update equipment (Supervisor/Manager only)
router.put('/:id', authenticateToken, checkRole(['supervisor', 'manager']), async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete equipment (Manager only)
router.delete('/:id', authenticateToken, checkRole(['manager']), async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;