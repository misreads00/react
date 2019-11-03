import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changeField, initializeForm, login } from '../../modules/auth';
import AuthForm from '../../components/auth/AuthForm';
import { check } from '../../modules/user';
import { withRouter } from 'react-router-dom';

const LoginForm = ({ history }) => {
    const [error, setError] = useState(null);

    const dispatch = useDispatch();
    const { form, auth, authError, user } = useSelector(({ auth, user }) => ({ 
        form: auth.login,
        auth: auth.auth,
        authError: auth.authError,
        user:user.user
    })); 
        
        
    // input 변경 이벤트 핸들러 
    const onChange = e => {
        const { value, name } = e.target;
        dispatch(
            changeField({
                form: 'login',
                key: name,
                value
            })
        );
    };

    //form 등록 이벤트 핸들러 
    const onSubmit = e => {
        e.preventDefault();
        const { username, password } = form; 
        dispatch(login({ username, password }));
    };


    //컴포넌트가 처음 렌더링될 때 form을 초기화 
    useEffect(() => {
        dispatch(initializeForm('login')); 
    }, [dispatch]); 

    //회원가입 성공/실패 처리 
    useEffect(() => {
        if (authError) {
            console.log('오류발생');
            console.log(authError);
            setError('로그인 실패');
            return;
        } 
        if (auth) {
            console.log('로그인 성공');
            dispatch(check());
        }
    }, [auth, authError, dispatch]); 

    //user 값이 잘 설정되었는지 확인 
    useEffect(() => {
        if (user) {
            history.push('/'); //홈으로 이동 
            try {
                localStorage.setItem('user', JSON.stringify(user));
            } catch (e) {
                console.log('localStorage is not working');
            }
         }
    }, [history, user]);

    return (
        <AuthForm 
            type="login" 
            form={form} 
            onChange={onChange} 
            onSubmit={onSubmit} 
            error={error}
        />
    );
};

export default withRouter(LoginForm); 

