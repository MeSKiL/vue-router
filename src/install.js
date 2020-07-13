import View from './components/view'
import Link from './components/link'

export let _Vue
// 所有插件的install的第一个参数都是Vue，use的时候就会执行install
export function install (Vue) {
  // 只执行一次
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () {
      // new Vue根实例的时候会传入router
      if (isDef(this.$options.router)) {
        // 根router
        this._routerRoot = this
        // 实例上存上router
        this._router = this.$options.router
        this._router.init(this)
        // 将下划线_route变成响应式的，值为当前路由
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        // 所有组件的_routerRoot都是根路由
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  // 原型上定义了$router和$route,所有的vue实例就有这两个属性了
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
