import { PageContainer } from '@ant-design/pro-layout';
import { useRef } from 'react';
import type { ProColumns, ActionType } from '@jetlinks/pro-table';
import type { CommandItem } from '@/pages/device/Command/typings';
import { Button, Tooltip } from 'antd';
import moment from 'moment';
import { EyeOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { useIntl } from '@@/plugin-locale/localeExports';
import Service from '@/pages/device/Command/service';
import ProTable from '@jetlinks/pro-table';
import Create from '@/pages/device/Command/create';

export const service = new Service('device/message/task');
const Command = () => {
  const actionRef = useRef<ActionType>();
  const intl = useIntl();

  const columns: ProColumns<CommandItem>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: intl.formatMessage({
        id: 'pages.table.deviceId',
        defaultMessage: '设备ID',
      }),
      dataIndex: 'deviceId',
    },
    {
      title: intl.formatMessage({
        id: 'pages.table.deviceName',
        defaultMessage: '设备名称',
      }),
      dataIndex: 'deviceName',
    },
    {
      title: intl.formatMessage({
        id: 'pages.device.command.type',
        defaultMessage: '指令类型',
      }),
      dataIndex: 'messageType',
      filters: [
        {
          text: intl.formatMessage({
            id: 'pages.device.command.type.readProperty',
            defaultMessage: '读取属性',
          }),
          value: 'READ_PROPERTY',
        },
        {
          text: intl.formatMessage({
            id: 'pages.device.command.type.writeProperty',
            defaultMessage: '设置属性',
          }),
          value: 'WRITE_PROPERTY',
        },
        {
          text: intl.formatMessage({
            id: 'pages.device.command.type.invokeFunction',
            defaultMessage: '调用属性',
          }),
          value: 'INVOKE_FUNCTION',
        },
      ],
    },
    {
      title: intl.formatMessage({
        id: 'pages.searchTable.titleStatus',
        defaultMessage: '状态',
      }),
      dataIndex: 'state',
      filters: [
        {
          text: intl.formatMessage({
            id: 'pages.device.command.status.wait',
            defaultMessage: '等待中',
          }),
          value: 'wait',
        },
        {
          text: intl.formatMessage({
            id: 'pages.device.command.status.sendError',
            defaultMessage: '发送失败',
          }),
          value: 'sendError',
        },
        {
          text: intl.formatMessage({
            id: 'pages.device.command.status.success',
            defaultMessage: '发送成功',
          }),
          value: 'success',
        },
      ],
      render: (value: any) => value.text,
    },
    {
      title: intl.formatMessage({
        id: 'pages.device.command.lastError',
        defaultMessage: '错误信息',
      }),
      dataIndex: 'lastError',
    },
    {
      title: intl.formatMessage({
        id: 'pages.device.command.sendTime',
        defaultMessage: '发送时间',
      }),
      dataIndex: 'sendTimestamp',
      render: (text: any) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: intl.formatMessage({
        id: 'pages.data.option',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      align: 'center',
      width: 200,
      render: (text, record) => [
        <a
          onClick={() => {
            // setVisible(true);
            // setCurrent(record);
          }}
        >
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.data.option.detail',
              defaultMessage: '查看',
            })}
            key={'detail'}
          >
            <EyeOutlined />
          </Tooltip>
        </a>,
        <a>
          {record.state.value !== 'wait' && (
            <a
              onClick={() => {
                // service.resend(encodeQueryParam({ terms: { id: record.id } })).subscribe(
                //   data => {
                //     message.success('操作成功');
                //   },
                //   () => {},
                //   () => handleSearch(searchParam),
                // );
              }}
            >
              <Tooltip
                title={intl.formatMessage({
                  id: 'pages.device.command.option.send',
                  defaultMessage: '重新发送',
                })}
              >
                <SyncOutlined />
              </Tooltip>
            </a>
          )}
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<CommandItem>
        toolBarRender={() => [
          <Button onClick={() => {}} key="button" icon={<PlusOutlined />} type="primary">
            {intl.formatMessage({
              id: 'pages.data.option.add',
              defaultMessage: '新增',
            })}
          </Button>,
        ]}
        request={async (params) => service.query(params)}
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
      />
      <Create />
    </PageContainer>
  );
};
export default Command;