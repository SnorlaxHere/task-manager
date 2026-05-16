const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  status:      { type: String, enum: ['active', 'completed', 'on_hold'], default: 'active' },
  startDate:   { type: Date },
  endDate:     { type: Date },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:     [projectMemberSchema],
}, { timestamps: true });

// Ensure creator is always a member (admin)
projectSchema.pre('save', function () {
  const creatorIsMember = this.members.some(
    m => m.user.toString() === this.createdBy.toString()
  );
  if (!creatorIsMember) {
    this.members.push({ user: this.createdBy, role: 'admin' });
  }
});

module.exports = mongoose.model('Project', projectSchema);
