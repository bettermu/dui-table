import GlobalConfig from '../../v-x-e-table/src/conf'
import DUtils from '../../tools/d-utils.umd.min'

/**
 * 全局参数设置
 */
export function setup(options) {
    return DUtils.merge(GlobalConfig, options)
}