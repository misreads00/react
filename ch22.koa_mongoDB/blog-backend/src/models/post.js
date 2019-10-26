import mongoose from 'mongoose';

const { Schema } = mongoose;

const PostSchema = new Schema({
    title: String,
    body: String,
    tags: [String],
    publishedDate: {
        type: Date,
        default: Date.now,
    },
}); 

const Post = mongoose.model('Post', PostSchema); //(스키마이름, 스키마객체)
export default Post;