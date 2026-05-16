const mongoose = require('mongoose');

const taskHistorySchema = new mongoose.Schema({
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fieldName: { type: String },
  oldValue:  { type: String },
  newValue:  { type: String },
  changedAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
  project:        { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title:          { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
  description:    { type: String, trim: true, default: '' },
  status:         { type: String, enum: ['todo', 'in_progress', 'review', 'completed'], default: 'todo' },
  priority:       { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  estimatedHours: { type: Number, min: 0 },
  progress:       { type: Number, min: 0, max: 100, default: 0 },
  dueDate:        { type: Date },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignees:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  history:        [taskHistorySchema],
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
