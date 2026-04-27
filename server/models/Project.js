import mongoose_Project from 'mongoose';

const projectSchema = new mongoose_Project.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    owner: { type: mongoose_Project.Schema.Types.ObjectId, ref: 'User', required: true },
    applicants: [{ type: mongoose_Project.Schema.Types.ObjectId, ref: 'User' }],
    creative: { type: mongoose_Project.Schema.Types.ObjectId, ref: 'User', default: null },
    requiredSkills: [{ type: String }],
    budget: { type: Number },
    status: { 
        type: String, 
        enum: ['open', 'in_progress', 'pending_approval', 'closed'], 
        default: 'open' 
    },
    projectEmbedding: { type: [Number] }
}, { timestamps: true });

const Project = mongoose_Project.model('Project', projectSchema);
export default Project;
