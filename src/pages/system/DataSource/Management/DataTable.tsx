import { Form, FormGrid, FormItem, Input, Password, Select } from '@formily/antd';
import { createForm } from '@formily/core';
import type { ISchema } from '@formily/react';
import { createSchemaField } from '@formily/react';
import { Modal } from 'antd';

interface Props {
  close: () => void;
  save: (data: any) => void;
  data: any;
}

const DataTable = (props: Props) => {
  const form = createForm({
    validateFirst: true,
    initialValues: props.data,
  });

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      Input,
      Password,
      Select,
      FormGrid,
    },
  });

  const schema: ISchema = {
    type: 'object',
    properties: {
      name: {
        title: '名称',
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-decorator-props': {
          gridSpan: 1,
        },
        'x-component-props': {
          placeholder: '请输入名称',
        },
        name: 'name',
        'x-validator': [
          {
            max: 64,
            message: '最多可输入64个字符',
          },
          {
            required: true,
            message: '请输入名称',
          },
        ],
        required: true,
      },
    },
  };

  const handleSave = async () => {
    const data: any = await form.submit();
    props.save(data);
  };

  return (
    <Modal
      title={`${props.data?.name ? '编辑' : '新增'}`}
      visible
      onCancel={() => {
        props.close();
      }}
      onOk={() => {
        handleSave();
      }}
    >
      <Form form={form} layout="vertical">
        <SchemaField schema={schema} />
      </Form>
    </Modal>
  );
};

export default DataTable;