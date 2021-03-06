/* eslint-disable */
import DUtils from './tools/d-utils.umd.min'
import GlobalConfig from './v-x-e-table/src/conf'
import { formats } from './v-x-e-table/src/formats'
import { toFilters } from './utils'
import { getFuncText } from './tools/utils'
import { warnLog, errLog } from './tools/log'

export class ColumnInfo {
    /* eslint-disable @typescript-eslint/no-use-before-define */
    constructor($duitable, _vm, { renderHeader, renderCell, renderFooter, renderData } = {}) {
        const $xegrid = $duitable.$xegrid
        const proxyOpts = $xegrid ? $xegrid.proxyOpts : null
        const formatter = _vm.formatter
        const visible = DUtils.isBoolean(_vm.visible) ? _vm.visible : true

        if (process.env.VUE_APP_VXE_TABLE_ENV === 'development') {
            const types = ['seq', 'checkbox', 'radio', 'expand', 'html']
            if (_vm.type && types.indexOf(_vm.type) === -1) {
                warnLog('vxe.error.errProp', [`type=${_vm.type}`, types.join(', ')])
            }
            if (DUtils.isBoolean(_vm.cellRender) || (_vm.cellRender && !DUtils.isObject(_vm.cellRender))) {
                warnLog('vxe.error.errProp', [`column.cell-render=${_vm.cellRender}`, 'column.cell-render={}'])
            }
            if (DUtils.isBoolean(_vm.editRender) || (_vm.editRender && !DUtils.isObject(_vm.editRender))) {
                warnLog('vxe.error.errProp', [`column.edit-render=${_vm.editRender}`, 'column.edit-render={}'])
            }
            if (_vm.cellRender && _vm.editRender) {
                warnLog('vxe.error.errConflicts', ['column.cell-render', 'column.edit-render'])
            }
            if (_vm.type === 'expand') {
                if ($duitable.treeConfig && $duitable.treeOpts.line) {
                    errLog('vxe.error.errConflicts', ['tree-config.line', 'column.type=expand'])
                }
            }
            if (_vm.remoteSort) {
                warnLog('vxe.error.delProp', ['column.remote-sort', 'sort-config.remote'])
            }
            if (_vm.sortMethod) {
                warnLog('vxe.error.delProp', ['column.sort-method', 'sort-config.sortMethod'])
            }
            if (formatter) {
                if (DUtils.isString(formatter)) {
                    const globalFunc = formats.get(formatter) || DUtils[formatter]
                    if (!DUtils.isFunction(globalFunc)) {
                        errLog('vxe.error.notFunc', [formatter])
                    }
                } else if (DUtils.isArray(formatter)) {
                    const globalFunc = formats.get(formatter[0]) || DUtils[formatter[0]]
                    if (!DUtils.isFunction(globalFunc)) {
                        errLog('vxe.error.notFunc', [formatter[0]])
                    }
                }
            }
        }

        Object.assign(this, {
            // ????????????
            type: _vm.type,
            property: _vm.field,
            field: _vm.field,
            title: _vm.title,
            width: _vm.width,
            minWidth: _vm.minWidth,
            resizable: _vm.resizable,
            fixed: _vm.fixed,
            align: _vm.align,
            headerAlign: _vm.headerAlign,
            footerAlign: _vm.footerAlign,
            showOverflow: _vm.showOverflow,
            showHeaderOverflow: _vm.showHeaderOverflow,
            showFooterOverflow: _vm.showFooterOverflow,
            className: _vm.className,
            headerClassName: _vm.headerClassName,
            footerClassName: _vm.footerClassName,
            formatter: formatter,
            sortable: _vm.sortable,
            sortBy: _vm.sortBy,
            sortType: _vm.sortType,
            sortMethod: _vm.sortMethod,
            remoteSort: _vm.remoteSort,
            filters: toFilters(_vm.filters),
            filterMultiple: DUtils.isBoolean(_vm.filterMultiple) ? _vm.filterMultiple : true,
            filterMethod: _vm.filterMethod,
            filterResetMethod: _vm.filterResetMethod,
            filterRecoverMethod: _vm.filterRecoverMethod,
            filterRender: _vm.filterRender,
            treeNode: _vm.treeNode,
            cellType: _vm.cellType,
            cellRender: _vm.cellRender,
            editRender: _vm.editRender,
            contentRender: _vm.contentRender,
            exportMethod: _vm.exportMethod,
            footerExportMethod: _vm.footerExportMethod,
            titleHelp: _vm.titleHelp,
            titlePrefix: _vm.titlePrefix,
            // ???????????????
            params: _vm.params,
            // ????????????
            id: _vm.colId || DUtils.uniqueId('col_'),
            parentId: null,
            visible,
            // ???????????????????????????????????????????????????????????????
            halfVisible: false,
            defaultVisible: visible,
            checked: false,
            halfChecked: false,
            disabled: false,
            level: 1,
            rowSpan: 1,
            colSpan: 1,
            order: null,
            sortTime: 0,
            renderWidth: 0,
            renderHeight: 0,
            resizeWidth: 0,
            renderLeft: 0,
            renderArgs: [], // ???????????????????????????
            model: {},
            renderHeader: renderHeader || _vm.renderHeader,
            renderCell: renderCell || _vm.renderCell,
            renderFooter: renderFooter || _vm.renderFooter,
            renderData: renderData,
            // ???????????????????????? grid ??????
            slots: _vm.slots
        })
        if (proxyOpts && proxyOpts.beforeColumn) {
            proxyOpts.beforeColumn({ $grid: $xegrid, column: this })
        }
    }

    getTitle() {
        return getFuncText(this.title || (this.type === 'seq' ? GlobalConfig.i18n('??????') : ''))
    }

    getKey() {
        return this.property || (this.type ? `type=${this.type}` : null)
    }

    update(name, value) {
        // ????????????????????????
        if (name !== 'filters') {
            if (name === 'field') {
                // ???????????????
                this.property = value
            }
            this[name] = value
        }
    }
}