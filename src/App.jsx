import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import AppLayout from './components/layout/AppLayout'

import SplashLogin from './pages/auth/SplashLogin'
import OnboardingOcr from './pages/auth/OnboardingOcr'
import Home from './pages/home/Home'
import OrderList from './pages/orders/OrderList'
import OrderDetail from './pages/orders/OrderDetail'
import OrderChat from './pages/orders/OrderChat'
import OrderSchemaEditor from './pages/orders/OrderSchemaEditor'
import PortfolioList from './pages/portfolio/PortfolioList'
import PortfolioForm from './pages/portfolio/PortfolioForm'
import StoreManage from './pages/store/StoreManage'
import MenuManager from './pages/store/MenuManager'
import ReviewManager from './pages/reviews/ReviewManager'
import Stats from './pages/stats/Stats'
import ChatManage from './pages/chat/ChatManage'
import ChatRoom from './pages/chat/ChatRoom'

function Gate({ children }) {
  const { isLoggedIn, onboarded } = useAuthStore()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (!onboarded) return <Navigate to="/onboarding" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<SplashLogin />} />
        <Route path="/onboarding" element={<OnboardingOcr />} />

        <Route
          element={
            <Gate>
              <AppLayout />
            </Gate>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/schema" element={<OrderSchemaEditor />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          <Route path="/orders/:orderId/chat" element={<OrderChat />} />
          <Route path="/menus" element={<MenuManager />} />
          <Route path="/portfolio" element={<Navigate to="/menus" replace />} />
          <Route path="/portfolio/new" element={<PortfolioForm />} />
          <Route path="/portfolio/:portfolioId/edit" element={<PortfolioForm />} />
          <Route path="/store" element={<StoreManage />} />
          <Route path="/store/menus" element={<Navigate to="/menus" replace />} />
          <Route path="/reviews" element={<ReviewManager />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/chat" element={<ChatManage />} />
          <Route path="/chat/:roomNumber" element={<ChatRoom />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}