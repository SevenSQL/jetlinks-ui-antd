import { Button, Tooltip, Popconfirm } from 'antd';
import type { TooltipProps, PopconfirmProps, ButtonProps } from 'antd';
import usePermissions from '@/hooks/permission';
import { useCallback } from 'react';
import { useIntl } from '@@/plugin-locale/localeExports';

interface PermissionButtonProps extends ButtonProps {
  tooltip?: TooltipProps;
  popConfirm?: PopconfirmProps;
  isPermission?: boolean;
}

/**
 * 权限按钮
 * @param props
 * @example 引入改组件，使用组件内部 usePermission 获取相应权限
 */
const PermissionButton = (props: PermissionButtonProps) => {
  const { tooltip, popConfirm, isPermission, ...buttonProps } = props;

  const _isPermission = 'isPermission' in props ? !isPermission : false;

  const intl = useIntl();

  const defaultButton = <Button disabled={_isPermission} {...buttonProps} />;

  const isTooltip = tooltip ? <Tooltip {...tooltip}>{defaultButton}</Tooltip> : null;

  const noPermission = (
    <Tooltip
      title={intl.formatMessage({
        id: 'pages.data.option.noPermission',
        defaultMessage: '没有权限',
      })}
    >
      {defaultButton}
    </Tooltip>
  );

  const init = useCallback(() => {
    // 如果有权限
    if (isPermission) {
      if (popConfirm) {
        if (tooltip) {
          popConfirm.children = isTooltip;
        }
        return <Popconfirm disabled={!isPermission} {...popConfirm} />;
      } else if (tooltip && !popConfirm) {
        return isTooltip;
      }
    }
    return noPermission;
  }, [props, isPermission]);

  return <>{init()}</>;
};

PermissionButton.usePermission = usePermissions;

export default PermissionButton;
