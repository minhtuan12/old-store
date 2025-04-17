import authReducer from './slices/auth'
import appReducer from './slices/app'
import categoryReducer from './slices/category'
import postReducer from './slices/post'
import chatReducer from './slices/chat'
import orderReducer from './slices/order'

const rootReducer = {
    app: appReducer,
    auth: authReducer,
    category: categoryReducer,
    post: postReducer,
    chat: chatReducer,
    order: orderReducer,
}

export default rootReducer
