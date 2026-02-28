import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import staffAuthReducer from '@/features/auth/staff/slices/StaffAuthSlice'
import { staffAuthApi } from '@/features/auth/staff/apis/StaffAuthAPI'
import { bookingsApi } from '@/features/api/bookings/apis/BookingsAPI'
import { staffManagementApi } from '@/features/api/staff/apis/StaffManagementAPI'
import { adminApi } from '@/features/core/admin/apis/AdminAPI'
import { companyApi } from '@/features/api/company/apis/CompanyAPI'
import globalErrorReducer from '@/store/slices/GlobalErrorSlice'
import { rtkQueryErrorLogger } from '@/store/middleware/errorMiddleware'

const rootReducer = combineReducers({
    staffAuth: staffAuthReducer,
    [staffAuthApi.reducerPath]: staffAuthApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [staffManagementApi.reducerPath]: staffManagementApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [companyApi.reducerPath]: companyApi.reducer,
    globalError: globalErrorReducer,
})

const persistedReducer = persistReducer(
    {
        key: 'root',
        storage,
        whitelist: ['staffAuth'], // whitelist slices here
    },
    rootReducer
)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(
            staffAuthApi.middleware,
            bookingsApi.middleware,
            staffManagementApi.middleware,
            adminApi.middleware,
            companyApi.middleware,
            rtkQueryErrorLogger
        ),
})

export const persistor = persistStore(store)

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
