const checkLoggedIn = (ctx, next) => {
    if (!ctx.state.user) {
        ctx.status = 401; //Unauthorized 
        console.log("checkedLoggedin 에러")
        return;
    } 
    return next();
};

export default checkLoggedIn;