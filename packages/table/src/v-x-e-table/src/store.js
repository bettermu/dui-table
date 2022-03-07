import DUtils from '../../tools/d-utils.umd.min'
import { warnLog } from '../../tools/log'

/**
 * 创建数据仓库
 */
class Store {
    constructor() {
        this.store = {}
    }

    mixin(map) {
        Object.assign(this.store, map)
        return Store
    }

    get(name) {
        return this.store[name]
    }

    add(name, render) {
        // 检测是否覆盖
        if (process.env.VUE_APP_VXE_TABLE_ENV === 'development') {
            if (!DUtils.eqNull(this.store[name]) && this.store[name] !== render) {
                warnLog('vxe.error.coverProp', [this._name, name])
            }
        }
        this.store[name] = render
        return Store
    }

    delete(name) {
        delete this.store[name]
        return Store
    }
}

export default Store