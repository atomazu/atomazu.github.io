
export const state = {
    isLoggedIn: false,
    token: null
};

export function setLoginState(isLoggedIn, token) {
    if (state.isLoggedIn === isLoggedIn && state.token === token) {
        return false;
    }
    state.isLoggedIn = isLoggedIn;
    state.token = token;
    window.dispatchEvent(new CustomEvent('loginStateChange'));
    return true;
}
