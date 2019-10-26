/* eslint-disable require-atomic-updates */
import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';

const { ObjectId } = mongoose.Types; 

export const checkObjectId = (ctx, next) => {
    const { id } = ctx.params;
    if (!ObjectId.isValid(id)) {
        ctx.status = 400; //Bad Request
        return;
    }
    return next();
};

// POST /api/posts {title, body, tags}
export const write = async ctx => {
    //객체가 다음 필드를 가지고있음을 검증 
    const schema = Joi.object().keys({ 
        title: Joi.string().required(), //required는 필수항목
        body : Joi.string().required(),
        tags : Joi.array()
                .items(Joi.string())
                .required(), //문자열로 된 배열 
    });
    //검증 후 실패인 경우 에러처리 
    const result = Joi.validate(ctx.request.body, schema); 
    if (result.error) {
        ctx.status = 400; //Bad request 
        ctx.body = result.error; 
        return;
    }

    const { title, body, tags } = ctx.request.body;
    const post = new Post({
        title, body, tags, 
    });

    try {
        await post.save();
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};

// GET /api/posts 
export const list = async ctx => {
    //pagination : query문자열을 숫자로 변환해줘야하고, 값 주어지지 않았다면 1을 기본. 
    const page = parseInt(ctx.query.page || '1',10);
    if (page<1) {
        ctx.status = 400;
        return;
    } 

    try {
        const posts = await Post.find()
        .sort({ _id:-1 })
        .limit(10)
        .skip((page-1) * 10)
        .lean() //toJSON() 안해도 처음부터 조회가능. 
        .exec();
        //Last-Page라는 커스텀 HTTP 헤더 설정하는 방법. 
        const postCount = await Post.countDocuments().exec();
        ctx.set('Last-Page', Math.ceil(postCount / 10));
        //200자 초과할경우 생략하도록 표기. 
        ctx.body = posts.map(post => ({
            ...post,
            body: post.body.length < 200 ? post.body : `${post.body.slice(0,200)}...`, 
        }));
    } catch (e) {
        ctx.throw(500, e);
    }
};

// GET /api/posts/:id 
export const read = async ctx => {
    const { id } = ctx.params;
    try {
        const post = await Post.findById(id).exec();
        if (!post) {
            ctx.status = 404; 
            return; 
        }
        ctx.body = post; 
    } catch (e) {
        ctx.throw(500, e);
    }
};

// DELETE /api/posts/:id 
export const remove = async ctx => {
    const { id } = ctx.params;
    try {
        await Post.findByIdAndRemove(id).exec();
        ctx.status = 204; //No content 
    } catch (e) {
        ctx.throw(500, e);
    }
};

// UPDATE /api/posts/:id {title, body, tags}
export const update = async ctx => {
    const { id } = ctx.params;

    //객체가 다음 필드를 가지고있음을 검증 - 단, required가 없다. 
    const schema = Joi.object().keys({
        title: Joi.string(),
        body: Joi.string(),
        tags: Joi.array().items(Joi.string()),
    });

    //검증 후 실패인 경우 에러처리 
    const result = Joi.validate(ctx.request.body, schema);
    if (result.error) {
        ctx.status = 400; //Bad request 
        ctx.body = result.error;
        return;
    }

    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true, //이값을 설정하면 업데이트된 데이터를 반환. false일땐 업데이트전 데이터. 
        }).exec();
        if (!post) {
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};

