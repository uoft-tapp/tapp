import Welcome from "./modules/welcome/components/Welcome"
import Private from "./modules/private/components/Private"

export const openRoutes = [
    {
        path: "/",
        component: Welcome
    }
]

export const privateRoutes = [
    {
        path: "/private",
        component: Private
    }
]
