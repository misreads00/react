/* eslint-disable require-atomic-updates */
import Joi from 'joi';
import User from '../../models/user';

export const register = async ctx => {
    //회원가입 - Request Body 검증하기 
    const schema = Joi.object().keys({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(20)
            .required(),
        password: Joi.string().required(),
    });
    const result = Joi.validate(ctx.request.body, schema);
    if (result.error) {
        ctx.status = 400; 
        ctx.body = result.error;
        return;
    }


    const { username, password } = ctx.request.body;
    try {
        //username 중복여부 확인 
        const exists = await User.findByUsername(username);
        if (exists) {
            ctx.status = 409; //Conflict
            return; 
        }
        
        const user = new User({
            username,
        });
        await user.setPassword(password); //비번설정 
        await user.save(); //db에 저장 

        //serialize : 응답할 데이터에서 hasedPassword필드 응답안되도록 JSON변환 후 제거 
        ctx.body = user.serialize();

        const token = user.generateToken();
        ctx.cookies.set('access_token', token, {
            maxAge : 1000 * 60 * 60 * 24 * 7, //7일
            httpOnly: true, 
        });
    } catch (e) {
        ctx.throw(500, e);
        }
};



export const login = async ctx => {
    //로그인
    const { username, password } = ctx.request.body;
    if(!username || !password) {
        ctx.status = 401; //Unauthorized
        return;
    }

    try { 
        //계정 존재하지 않을때 
        const user = await User.findByUsername(username);
        if (!user) {
            ctx.status = 401; //Unauthorized
            return;
        }
        //잘못된 비번 
        const valid = await user.checkPassword(password);
        if (!valid) {
            ctx.status = 401; //Unauthorized
            return;
        }
        ctx.body = user.serialize();
        const token = user.generateToken();
        ctx.cookies.set('access_token', token, {
            maxAge: 1000 * 60 * 60 * 24 * 7, //7일
            httpOnly: true,
        });
    } catch (e) {
        ctx.throw(500, e);
    }
};



export const check = async ctx => {
    //로그인상태 확인 
    const { user } = ctx.state;
    if (!user) {
        ctx.status = 401; //Unauthorized 
        return;
    }
    ctx.body = user; 
};


export const logout = async ctx => {
    //로그아웃
    ctx.cookies.set('access_token');
    ctx.status = 204; //No content 
};