import React, { FC, Fragment, useEffect, useState } from 'react';
import styles from '@/utils/table.less';
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Icon,
  Menu,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Table,
} from 'antd';
import { router } from 'umi';
import { ColumnProps, PaginationConfig, SorterResult } from 'antd/lib/table';
import { FormComponentProps } from 'antd/es/form';
import { ConnectState, Dispatch } from '@/models/connect';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import encodeQueryParam from '@/utils/encodeParam';
import apis from '@/services';
import { getAccessToken } from '@/utils/authority';
import moment from 'moment';
import Save from './Save';
import Search from './Search';
import { DeviceInstance } from './data.d';
import Process from './Process';
import Import from './operation/import';
import Export from './operation/export';
import { DeviceProduct } from '@/pages/device/product/data';
import { getPageQuery } from '@/utils/utils';

interface Props extends FormComponentProps {
  loading: boolean;
  dispatch: Dispatch;
  deviceInstance: any;
}

interface State {
  data: any;
  searchParam: any;
  addVisible: boolean;
  currentItem: Partial<DeviceInstance>;
  processVisible: boolean;
  importLoading: boolean;
  action: string;
  deviceCount: any;
  productList: DeviceProduct[];
}

const DeviceInstancePage: React.FC<Props> = props => {
  const { result } = props.deviceInstance;
  const initState: State = {
    data: result,
    searchParam: { pageSize: 10 },
    addVisible: false,
    currentItem: {},
    processVisible: false,
    importLoading: false,
    action: '',
    deviceCount: {
      notActiveCount: 0,
      offlineCount: 0,
      onlineCount: 0,
      deviceTotal: 0,
      loading: true,
    },
    productList: [],
  };

  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const [addVisible, setAddVisible] = useState(initState.addVisible);
  const [currentItem, setCurrentItem] = useState(initState.currentItem);
  const [importLoading, setImportLoading] = useState(initState.importLoading);
  const [action, setAction] = useState(initState.action);
  const [productList, setProductList] = useState(initState.productList);
  const [product, setProduct] = useState("");
  const [deviceCount, setDeviceCount] = useState(initState.deviceCount);
  const [deviceImport, setDeviceImport] = useState(false);
  const [deviceExport, setDeviceExport] = useState(false);

  const { dispatch } = props;

  const statusMap = new Map();
  statusMap.set('在线', 'success');
  statusMap.set('离线', 'error');
  statusMap.set('未激活', 'processing');

  const handleSearch = (params?: any) => {
    setSearchParam(params);
    dispatch({
      type: 'deviceInstance/query',
      payload: encodeQueryParam(params),
    });
  };

  const delelteInstance = (record: any) => {
    apis.deviceInstance
      .remove(record.id)
      .then(response => {
        if (response.status === 200) {
          message.success('操作成功');
          handleSearch(searchParam);
        }
      })
      .catch(() => {
      });
  };

  const changeDeploy = (record: any) => {
    apis.deviceInstance
      .changeDeploy(record.id)
      .then(response => {
        if (response.status === 200) {
          message.success('操作成功');
          handleSearch(searchParam);
        }
      })
      .catch(() => {
      });
  };

  const unDeploy = (record: any) => {
    apis.deviceInstance
      .unDeploy(record.id)
      .then(response => {
        if (response.status === 200) {
          message.success('操作成功');
          handleSearch(searchParam);
        }
      })
      .catch(() => {
      });
  };
  const columns: ColumnProps<DeviceInstance>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '设备名称',
      dataIndex: 'name',
    },
    {
      title: '设备型号',
      dataIndex: 'productName',
    },
    {
      title: '注册时间',
      dataIndex: 'registryTime',
      width: '200px',
      render: (text: any) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'state',
      width: '90px',
      render: record => record ? <Badge status={statusMap.get(record.text)} text={record.text}/> : '',
      filters: [
        {
          text: '未激活',
          value: 'notActive',
        },
        {
          text: '离线',
          value: 'offline',
        },
        {
          text: '在线',
          value: 'online',
        },
      ],
      filterMultiple: false,
    },
    {
      title: '描述',
      dataIndex: 'describe',
    },
    {
      title: '操作',
      width: '200px',
      align: 'center',
      render: (record: any) => (
        <Fragment>
          <a
            onClick={() => {
              router.push(`/device/instance/save/${record.id}`);
            }}
          >
            查看
          </a>
          <Divider type="vertical"/>
          <a
            onClick={() => {
              setCurrentItem(record);
              setAddVisible(true);
            }}
          >
            编辑
          </a>
          <Divider type="vertical"/>
          {record.state?.value === 'notActive' ? (
            <span>
              <Popconfirm
                title="确认激活？"
                onConfirm={() => {
                  changeDeploy(record);
                }}
              >
                <a>激活</a>
              </Popconfirm>
              <Divider type="vertical"/>
              <Popconfirm
                title="确认删除？"
                onConfirm={() => {
                  delelteInstance(record);
                }}
              >
                <a>删除</a>
              </Popconfirm>
            </span>
          ) : (
            <Popconfirm
              title="确认注销设备？"
              onConfirm={() => {
                unDeploy(record);
              }}
            >
              <a>注销</a>
            </Popconfirm>
          )}
        </Fragment>
      ),
    },
  ];

  const stateCount = (productId: string) => {
    const map = {
      notActiveCount: 0,
      offlineCount: 0,
      onlineCount: 0,
      deviceTotal: 0,
      loading: true,
    };
    for (let i = 0; i < 3; i++) {
      let val = '';
      if (i === 0) {
        val = 'notActive';
      } else if (i === 1) {
        val = 'offline';
      } else {
        val = 'online';
      }
      apis.deviceInstance.count(encodeQueryParam({
        terms: {
          state: val,
          productId: productId,
        },
      }))
        .then(res => {
          if (res.status === 200) {
            if (i === 0) {
              map.notActiveCount = res.result;
            } else if (i === 1) {
              map.offlineCount = res.result;
            } else {
              map.onlineCount = res.result;
            }
            apis.deviceInstance.count(encodeQueryParam({ terms: { productId: productId } }))
              .then(res => {
                if (res.status === 200) {
                  map.deviceTotal = res.result;
                  map.loading = false;
                  setDeviceCount(map);
                }
              }).catch();
          }
        }).catch();
    }
  };

  useEffect(() => {
    // 获取下拉框数据
    apis.deviceProdcut
      .queryNoPagin()
      .then(e => {
        setProductList(e.result);
      })
      .catch(() => {});

    const query:any = getPageQuery();
    if (query.hasOwnProperty("productId")){
      const { productId } = query;
      setProduct(productId);
      handleSearch({
        terms:{
          productId:query.productId
        },
        pageSize: 10
      });
      stateCount(productId);
    } else {
      handleSearch(searchParam);
      stateCount("");
    }
  }, []);

  const saveDeviceInstance = (item: any) => {
    dispatch({
      type: 'deviceInstance/update',
      payload: encodeQueryParam(item),
      callback: (response: any) => {
        if (response.status === 200) {
          message.success('保存成功');
          setAddVisible(false);
          router.push(`/device/instance/save/${item.id}`);
        }
      },
    });
  };

  const onTableChange = (
    pagination: PaginationConfig,
    filters: any,
    sorter: SorterResult<DeviceInstance>,
  ) => {
    let { terms } = searchParam;
    if (filters.state) {
      if (terms){
        terms.state = filters.state[0];
      } else {
        terms = {
          state:filters.state[0]
        }
      }
    }
    handleSearch({
      pageIndex: Number(pagination.current) - 1,
      pageSize: pagination.pageSize,
      terms,
      sorts: sorter,
    });
  };

  const [processVisible, setProcessVisible] = useState(false);

  const [api, setAPI] = useState<string>('');

  const getSearchParam = () => {
    const data = encodeQueryParam(searchParam);
    let temp = '';
    Object.keys(data).forEach((i: string) => {
      if (data[i] && i !== 'pageSize' && i !== 'pageIndex') {
        temp += `${i}=${data[i]}&`;
      }
    });
    return encodeURI(temp.replace(/%/g, '%'));
  };
  // 激活全部设备
  const startImport = () => {
    // let dt = 0;
    setProcessVisible(true);
    const activeAPI = `/jetlinks/device-instance/deploy?${getSearchParam()}:X_Access_Token=${getAccessToken()} `;
    setAPI(activeAPI);
    setAction('active');
  };

  const startSync = () => {
    setProcessVisible(true);
    const syncAPI = `/jetlinks/device-instance/state/_sync/?${getSearchParam()}:X_Access_Token=${getAccessToken()}`;
    setAPI(syncAPI);
    setAction('sync');
  };

  const activeDevice = () => {
    Modal.confirm({
      title: `确认激活全部设备`,
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk() {
        startImport();
      },
    });
  };

  const syncDevice = () => {
    Modal.confirm({
      title: '确定同步设备真实状态?',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk() {
        // 同步设备
        startSync();
      },
    });
  };

  const onDeviceProduct = (value: string) => {
    let { terms } = searchParam;
    if (terms) {
      terms.productId = value;
    } else {
      terms = {
        productId: value,
      };
    }

    handleSearch({
      pageIndex: searchParam.pageIndex,
      pageSize: searchParam.pageSize,
      terms,
      sorts: searchParam.sorter,
    });
    stateCount(value);
  };

  const Info: FC<{
    title: React.ReactNode;
    value: React.ReactNode;
  }> = ({ title, value }) => (
    <div>
      <span>{title}</span>
      <p style={{ fontSize: '26px' }}>{value}</p>
    </div>
  );

  const menu = (
    <Menu>
      <Menu.Item key="1">
        <Button icon="download" type="default" onClick={() => {
          setDeviceExport(true);
        }}>
          批量导出设备
        </Button>
      </Menu.Item>
      <Menu.Item key="2">
        <Button icon="upload" onClick={() => {
          setDeviceImport(true);
        }}>批量导入设备</Button>
      </Menu.Item>
      <Menu.Item key="3">
        <Button icon="check-circle" type="danger" onClick={() => activeDevice()}>
          激活全部设备
        </Button>
      </Menu.Item>
      <Menu.Item key="4">
        <Button icon="sync" type="danger" onClick={() => syncDevice()}>
          同步设备状态
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <PageHeaderWrapper title="设备实例">
      <div className={styles.standardList}>
        <Card bordered={false} style={{ height: 95 }} loading={deviceCount.loading}>
          <Row>
            <Col sm={8} xs={24}>
              <Select placeholder="请选择设备型号" allowClear style={{ width: 300, marginTop: 7 }} defaultValue={product}
                      onChange={(value: string) => {
                        setProduct(() => value);
                        onDeviceProduct(value);
                      }}
              >
                {productList.map(item => (
                  <Select.Option key={item.id}>{item.name}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col sm={4} xs={24}>
              <Info title="全部设备" value={deviceCount.deviceTotal}/>
            </Col>
            <Col sm={4} xs={24}>
              <Info title={<Badge status={statusMap.get('在线')} text="在线"/>} value={deviceCount.onlineCount}/>
            </Col>
            <Col sm={4} xs={24}>
              <Info title={<Badge status={statusMap.get('离线')} text="离线"/>} value={deviceCount.offlineCount}/>
            </Col>
            <Col sm={4} xs={24}>
              <Info title={<Badge status={statusMap.get('未激活')} text="未激活"/>} value={deviceCount.notActiveCount}/>
            </Col>
          </Row>
        </Card>
        <br/>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              <Search
                search={(params: any) => {
                  if (product) {
                    params.productId = product;
                  }
                  handleSearch({ terms: params, pageSize: 10 });
                }}
              />
            </div>
            <div className={styles.tableListOperator}>
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  setCurrentItem({});
                  setAddVisible(true);
                }}
              >
                添加设备
              </Button>

              <Divider type="vertical"/>

              <Dropdown overlay={menu}>
                <Button>
                  其他批量操作<Icon type="down"/>
                </Button>
              </Dropdown>

            </div>
            <div className={styles.StandardTable}>
              <Table
                loading={props.loading}
                columns={columns}
                dataSource={(result || {}).data}
                rowKey="id"
                onChange={onTableChange}
                pagination={{
                  current: result.pageIndex + 1,
                  total: result.total,
                  pageSize: result.pageSize,
                  showQuickJumper: true,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total: number) =>
                    `共 ${total} 条记录 第  ${result.pageIndex + 1}/${Math.ceil(
                      result.total / result.pageSize,
                    )}页`,
                }}
              />
            </div>
          </div>
        </Card>
        {addVisible && (
          <Save
            data={currentItem}
            close={() => {
              setAddVisible(false);
              setCurrentItem({});
            }}
            save={(item: any) => {
              saveDeviceInstance(item);
            }}
          />
        )}
        {(processVisible || importLoading) && (
          <Process
            api={api}
            action={action}
            closeVisible={() => {
              setProcessVisible(false);
              setImportLoading(false);
              handleSearch(searchParam);
            }}
          />
        )}
        {deviceImport && (
          <Import
            productId={product}
            close={() => {
              setDeviceImport(false);
              handleSearch(searchParam);
            }}
          />
        )}
        {deviceExport && (
          <Export
            productId={product}
            searchParam={searchParam}
            close={() => {
              setDeviceExport(false);
              handleSearch(searchParam);
            }}
          />
        )}
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ deviceInstance, loading }: ConnectState) => ({
  deviceInstance,
  loading: loading.models.deviceInstance,
}))(DeviceInstancePage);