[vite] connecting... client:495:9
[vite] connected. client:614:15
Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools chunk-FJ2A54M7.js:21551:25
Cookie “__cf_bm” has been rejected for invalid domain. websocket
Adding a listener for DOMAttrModified is deprecated and will be removed soon. Instead of a MutationEvent, use MutationObserver. https://developer.mozilla.org/docs/Web/API/MutationObserver content.js:30:326
Cookie “__cf_bm” has been rejected for invalid domain. websocket
Uncaught Error: Could not resolve "@emotion/styled" imported by "@mui/styled-engine". Is it installed?
    optional-peer-dep:__vite-optional-peer-dep: @mui_icons-material.js:128
    __require chunk-HXA6O6EE.js:14
    <anonymous> index.js:11
2 @mui_icons-material.js:128:11
The above error occurred in the <ProtectedRoute> component:

ProtectedRoute@http://192.168.100.30:8080/src/components/ProtectedRoute.tsx:15:24
RenderedRoute@http://192.168.100.30:8080/node_modules/.vite/deps/react-router-dom.js?v=b1f75450:4072:7
Outlet@http://192.168.100.30:8080/node_modules/.vite/deps/react-router-dom.js?v=b1f75450:4444:20
div
MainLayout@http://192.168.100.30:8080/src/components/layouts/MainLayout.tsx:13:20
RenderedRoute@http://192.168.100.30:8080/node_modules/.vite/deps/react-router-dom.js?v=b1f75450:4072:7
Routes@http://192.168.100.30:8080/node_modules/.vite/deps/react-router-dom.js?v=b1f75450:4510:7
Suspense
Router@http://192.168.100.30:8080/node_modules/.vite/deps/react-router-dom.js?v=b1f75450:4458:7
BrowserRouter@http://192.168.100.30:8080/node_modules/.vite/deps/react-router-dom.js?v=b1f75450:5200:7
ErrorBoundary@http://192.168.100.30:8080/src/components/ErrorBoundary.tsx:98:9
Provider@http://192.168.100.30:8080/node_modules/.vite/deps/chunk-NVMG6EBM.js?v=c7ea643f:38:47
TooltipProvider@http://192.168.100.30:8080/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=8e97c81f:69:7
AppContent@http://192.168.100.30:8080/src/App.tsx:62:23
QueryClientProvider@http://192.168.100.30:8080/node_modules/.vite/deps/@tanstack_react-query.js?v=e9a06714:2793:27
App
AuthProvider@http://192.168.100.30:8080/src/contexts/AuthContext.tsx:20:29
QueryClientProvider@http://192.168.100.30:8080/node_modules/.vite/deps/@tanstack_react-query.js?v=e9a06714:2793:27

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. chunk-FJ2A54M7.js:14032:23
Error caught: Error: Could not resolve "@emotion/styled" imported by "@mui/styled-engine". Is it installed?
    optional-peer-dep:__vite-optional-peer-dep: @mui_icons-material.js:128
    __require chunk-HXA6O6EE.js:14
    <anonymous> index.js:11
 
Object { componentStack: "\nProtectedRoute@http://192.168.100.30:8080/src/components/ProtectedRoute.tsx:15:24\nRenderedRoute@http://192.168.100.30:8080/node_modules/.vite/deps/react-router-dom.js?v=b1f75450:4072:7\nOutlet@http://192.168.100.30:8080/node_modules/.vite/deps/react-router-dom.js?v=b1f75450:4444:20\ndiv\nMainLayout@http://192.168.100.30:8080/src/components/layouts/MainLayout.tsx:13:20\nRenderedRoute@http://192.168.100.30:8080/node_modules/.vite/deps/react-router-dom.js?v=b1f75450:4072:7\nRoutes@http://192.168.100.30:8080/node_modules/.vite/deps/react-router-dom.js?v=b1f75450:4510:7\nSuspense\nRouter@http://192.168.100.30:8080/node_modules/.vite/deps/react-router-dom.js?v=b1f75450:4458:7\nBrowserRouter@http://192.168.100.30:8080/node_modules/.vite/deps/react-router-dom.js?v=b1f75450:5200:7\nErrorBoundary@http://192.168.100.30:8080/src/components/ErrorBoundary.tsx:98:9\nProvider@http://192.168.100.30:8080/node_modules/.vite/deps/chunk-NVMG6EBM.js?v=c7ea643f:38:47\nTooltipProvider@http://192.168.100.30:8080/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=8e97c81f:69:7\nAppContent@http://192.168.100.30:8080/src/App.tsx:62:23\nQueryClientProvider@http://192.168.100.30:8080/node_modules/.vite/deps/@tanstack_react-query.js?v=e9a06714:2793:27\nApp\nAuthProvider@http://192.168.100.30:8080/src/contexts/AuthContext.tsx:20:29\nQueryClientProvider@http://192.168.100.30:8080/node_modules/.vite/deps/@tanstack_react-query.js?v=e9a06714:2793:27" }
logging.ts:2:13
