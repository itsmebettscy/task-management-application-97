
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { CreateTaskDto, UpdateTaskDto } = require('../dtos/taskDto');

// GET /tasks - Fetch all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /tasks/:id - Fetch a single task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found, invalid ID' });
    }
    res.status(500).json({ message: error.message });
  }
});

// POST /tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const taskDto = new CreateTaskDto(req.body.title, req.body.description, req.body.status);
    const validationErrors = CreateTaskDto.validate(taskDto);
    
    if (validationErrors) {
      return res.status(400).json({ errors: validationErrors });
    }
    
    const task = new Task(taskDto);
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /tasks/:id - Update a task
router.put('/:id', async (req, res) => {
  try {
    const updateDto = new UpdateTaskDto(req.body);
    const validationErrors = UpdateTaskDto.validate(updateDto);
    
    if (validationErrors) {
      return res.status(400).json({ errors: validationErrors });
    }
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateDto,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found, invalid ID' });
    }
    res.status(400).json({ message: error.message });
  }
});

// DELETE /tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found, invalid ID' });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
