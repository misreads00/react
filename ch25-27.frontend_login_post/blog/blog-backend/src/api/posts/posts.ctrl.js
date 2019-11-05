/* eslint-disable require-atomic-updates */
import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';

const { ObjectId } = mongoose.Types; 

const sanitizeOption = {
    allowedTags: [
      'h1',
      'h2',
      'b',
      'i',
      'u',
      's',
      'p',
      'ul',
      'ol',
      'li',
      'blockquote',
      'a',
      'img',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target'],
      img: ['src'],
      li: ['class'],
    },
    allowedSchemes: ['data', 'http'],
  };




export const getPostById = async (ctx, next) => {
    const { id } = ctx.params;
    if (!ObjectId.isValid(id)) {
        ctx.status = 400; //Bad Request
        return;
    }
    //작성자만 post 수정/삭제 가능하도록 id로 post 찾고 ctx.state에 담는다.  
    try {
        const post = await Post.findById(id);
        if (!post) {
            ctx.status = 404; //Not found
            return;
        } 
        ctx.state.post = post; 
        return next();
    } catch (e) {
        ctx.throw(500, e);
    }
};

//위 id로 찾은 post가 로그인 중인 사용자가 작성한 것인지 확인 
//여기까지 작성하고 기존 export read 함수에 있던걸 다 생략함. 
export const checkOwnPost = (ctx, next) => {
    const { user, post } = ctx.state;
    if (post.user._id.toString() !== user._id) {
        ctx.status = 403; //사용자의 post 아님 
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
        title, 
        body:sanitizeHtml(body, sanitizeOption),
        tags, 
        user: ctx.state.user, 
    });
    try {
        await post.save();
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};



const removeHtmlAndShorten = body => {
    const filtered = sanitizeHtml(body, {
        allowedTags: [],
    });
    return filtered.length < 200 ? filtered : `${filtered.slice(0,200)}`; 
};

// GET /api/posts 
export const list = async ctx => {
    //pagination : query문자열을 숫자로 변환해줘야하고, 값 주어지지 않았다면 1을 기본. 
    const page = parseInt(ctx.query.page || '1',10);

    if (page < 1) {
        ctx.status = 400;
        return;
    } 

    const { tag, username } = ctx.query;
    //tag, username 값이 유효하면 객체안에 넣고, 그렇지 않으면 넣지 않음 
    const query = {
        ...(username ? {'user.username' : username } : {}),
        ...(tag ? { tags : tag } : {}),
    };
    try {
        const posts = await Post.find(query)
        .sort({ _id:-1 })
        .limit(10)
        .skip((page-1) * 10)
        .lean() //toJSON() 안해도 처음부터 조회가능. 
        .exec();
        //Last-Page라는 커스텀 HTTP 헤더 설정하는 방법. 
        const postCount = await Post.countDocuments(query).exec();
        ctx.set('Last-Page', Math.ceil(postCount / 10));
        //200자 초과할경우 생략하도록 표기. 
        ctx.body = posts.map(post => ({
            ...post,
            body: removeHtmlAndShorten(post.body),
        }));
    } catch (e) {
        ctx.throw(500, e);
    }
};



// GET /api/posts/:id 
export const read = ctx => {
    ctx.body = ctx.state.post;
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

    // 객체를 복사하고 + body 값이 주어졌으면 sanitizeHtml로 HTML 필터링
    const nextData = { ...ctx.request.body }; 
    if (nextData.body ) {
        nextData.body = sanitizeHtml(nextData.body);
    }

    try {
        const post = await Post.findByIdAndUpdate(id, nextData, {
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

