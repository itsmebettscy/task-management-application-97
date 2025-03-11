
class CreateTaskDto {
  constructor(title, description, status) {
    this.title = title;
    this.description = description;
    this.status = status || 'todo';
  }

  static validate(taskData) {
    const errors = [];
    
    if (!taskData.title || taskData.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!taskData.description || taskData.description.trim() === '') {
      errors.push('Description is required');
    }
    
    if (taskData.status && !['todo', 'in-progress', 'completed'].includes(taskData.status)) {
      errors.push('Status must be one of: todo, in-progress, completed');
    }
    
    return errors.length > 0 ? errors : null;
  }
}

class UpdateTaskDto {
  constructor(data) {
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.status !== undefined) this.status = data.status;
  }

  static validate(taskData) {
    const errors = [];
    
    if (taskData.title !== undefined && taskData.title.trim() === '') {
      errors.push('Title cannot be empty');
    }
    
    if (taskData.description !== undefined && taskData.description.trim() === '') {
      errors.push('Description cannot be empty');
    }
    
    if (taskData.status !== undefined && !['todo', 'in-progress', 'completed'].includes(taskData.status)) {
      errors.push('Status must be one of: todo, in-progress, completed');
    }
    
    return errors.length > 0 ? errors : null;
  }
}

module.exports = {
  CreateTaskDto,
  UpdateTaskDto
};
