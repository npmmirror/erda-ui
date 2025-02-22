// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import React from 'react';
import { Popover, Row, Col, Form, Button, Badge, Input } from 'antd';
import { ErdaIcon, RenderFormItem, IFormItem } from 'common';
import { cloneDeep, isEmpty, has } from 'lodash';
import ExternalItem from './external-item';
import { useUpdateEffect } from 'react-use';
import i18n from 'i18n';
import ConfigSelector from './config-selector';

import './index.scss';

export interface IProps {
  fieldsList: Field[];
  configList: ConfigData[];
  defaultConfig: number | string;
  onFilter: (data: Obj) => void;
  onDeleteFilter: (data: Obj) => void;
  onSaveFilter: (label: string, values: Obj) => void;
  value?: Obj;
  onConfigChange?: (config: ConfigData) => void;
  processField?: (field: Field) => IFormItem;
  hideSave?: boolean;
}

export interface Option {
  label: string;
  value: string;
  children?: Option[];
}

export interface Field {
  type: string;
  key: string;
  mode?: string;
  outside?: boolean;
  value: number | string;
  label: string;
  children?: Field[];
  placeholder?: string;
  options: Option[];
  haveFilter?: boolean;
  required?: boolean;
  emptyText?: string;
  getComp?: (props: Obj) => React.ReactNode;
  customProps?: Obj;
}

export interface ConfigData {
  id: number | string;
  label: string;
  values: Obj;
  isPreset?: boolean;
}

const sortObj = (obj: Obj) => {
  const values = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      if (Array.isArray(obj[key])) {
        if (obj[key].length !== 0) {
          values[key] = [...obj[key]].sort().join(',');
        }
      } else if (![undefined, null].includes(obj[key])) {
        values[key] = obj[key];
      }
    });
  return values;
};

const getItemByValues = (val: Obj, list: ConfigData[], fieldsList: Field[]) => {
  if (!list.length) return null;
  const reValue = {};
  fieldsList.forEach((item) => {
    if (!item.outside && has(val, item.key)) {
      reValue[item.key] = val[item.key];
    }
  });
  const values = sortObj(reValue);
  return list?.find((item) => JSON.stringify(sortObj(item.values || {})) === JSON.stringify(values)) || null;
};

const defaultProcessField = (item: IFormItem) => {
  const { type, itemProps, defaultValue, placeholder, disabled } = item;
  const field: IFormItem = { ...item };

  field.name = item.key;
  if (type === 'select' || type === 'tagsSelect') {
    field.itemProps = {
      mode: 'multiple',
      ...itemProps,
      showArrow: true,
      allowClear: true,
      suffixIcon: <ErdaIcon type="caret-down" color="currentColor" className="text-white-4" />,
      clearIcon: <span className="p-1">{i18n.t('common:clear')}</span>,
      getPopupContainer: () => document.body,
      dropdownClassName: `${itemProps?.dropdownClassName || ''} theme-dark`,
    };

    if (type === 'select') {
      field.itemProps.optionLabelProp = 'label';
    }
  } else if (type === 'dateRange') {
    field.itemProps = {
      customProps: {
        showClear: true,
      },
    };
  }

  field.itemProps = {
    defaultValue,
    placeholder,
    disabled,
    ...field.itemProps,
  };

  return field;
};

const convertValue = (value: Obj, fieldList: Field[]) => {
  const formValue = {};
  const externalValue = {};
  fieldList.forEach((item) => {
    if (item.outside) {
      externalValue[item.key] = value?.[item.key];
    } else {
      formValue[item.key] = value?.[item.key];
    }
  });
  return { formValue, externalValue };
};

const ConfigurableFilter = ({
  fieldsList,
  configList,
  defaultConfig,
  value,
  onFilter: onFilterProps,
  onDeleteFilter,
  onSaveFilter,
  processField,
  hideSave,
}: IProps) => {
  const { externalValue: _externalValue, formValue } = React.useMemo(
    () => convertValue(value, fieldsList),
    [value, fieldsList],
  );

  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const [externalValue, setExternalValue] = React.useState<Obj<string>>(_externalValue);
  const [visible, setVisible] = React.useState(false);
  const [currentConfig, setCurrentConfig] = React.useState<string | number>();
  const [isNew, setIsNew] = React.useState(false);
  const [addVisible, setAddVisible] = React.useState(false);

  React.useEffect(() => {
    if (formValue) {
      form.setFieldsValue(formValue || {});
      const config = getItemByValues(formValue, configList, fieldsList);
      config?.id && setCurrentConfig(config?.id);
      setIsNew(!config);
    } else if (configList && configList.length !== 0) {
      const configData: ConfigData = configList?.find((item) => item.id === defaultConfig) || ({} as ConfigData);
      if (configData.values) {
        configData.values && form.setFieldsValue(configData.values);
        onFilterProps?.(configData.values);
      }
    }
  }, [configList, defaultConfig, form, formValue, onFilterProps, fieldsList]);

  useUpdateEffect(() => {
    onFilter();
  }, [externalValue]);

  const onConfigChange = (config: ConfigData) => {
    setCurrentConfig(config.id);
    setIsNew(false);
    form.resetFields();
    form.setFieldsValue(config.values || {});
    onFilter();
  };

  const onValuesChange = (_, allValues: Obj) => {
    const config = getItemByValues(allValues, configList, fieldsList);
    if (config?.id) {
      setCurrentConfig(config?.id);
      setIsNew(false);
    } else {
      setIsNew(true);
    }
  };

  const saveFilter = (label: string) => {
    onSaveFilter(label, form.getFieldsValue());
  };

  const setAllOpen = () => {
    form.resetFields();
    const config = getItemByValues(form.getFieldsValue(), configList, fieldsList);
    setCurrentConfig(config?.id);
    setIsNew(false);
  };

  const onFilter = () => {
    form.validateFields().then((values) => {
      onFilterProps({ ...values, ...externalValue });
      setVisible(false);
    });
  };

  React.useEffect(() => {
    if (visible && formValue) {
      form.resetFields();
      form.setFieldsValue(formValue || {});
      const config = getItemByValues(formValue, configList, fieldsList);
      config?.id && setCurrentConfig(config?.id);
      setIsNew(!config);
    }
  }, [visible, form, configList, formValue, fieldsList]);

  const externalField = fieldsList.filter((item) => item.outside);

  const addConfigContent = (
    <div>
      <Form form={addForm} layout="vertical" className="p-4">
        <Form.Item
          label={i18n.t('dop:filter name')}
          name="label"
          rules={[
            { required: true, message: i18n.t('please enter {name}', { name: i18n.t('dop:filter name') }) },
            { max: 10, message: i18n.t('dop:within {num} characters', { num: 10 }) },
          ]}
        >
          <Input placeholder={i18n.t('dop:please enter, within {num} characters', { num: 10 })} />
        </Form.Item>
        <div className="mt-3">
          <Button
            type="primary"
            onClick={() => {
              addForm.validateFields().then(({ label }) => {
                saveFilter?.(label);
                setAddVisible(false);
              });
            }}
          >
            {i18n.t('ok')}
          </Button>
          <span
            className="text-white ml-3 cursor-pointer"
            onClick={() => {
              addForm.resetFields();
              setAddVisible(false);
            }}
          >
            {i18n.t('cancel')}
          </span>
        </div>
      </Form>
    </div>
  );

  const content = (
    <div className="flex-1">
      <div className="h-full flex flex-col overflow-hidden">
        <div className=" h-[48px] flex-h-center justify-between">
          <div className="flex-h-center">
            <span>{i18n.t('common:filter')}</span>
          </div>
          <ErdaIcon
            type="guanbi"
            fill="white"
            color="white"
            size={20}
            className="text-white cursor-pointer"
            onClick={() => setVisible(false)}
          />
        </div>
        <div className="flex justify-start flex-1 overflow-hidden">
          {!hideSave ? (
            <ConfigSelector
              className="overflow-auto"
              list={configList}
              value={currentConfig}
              isNew={isNew}
              defaultValue={defaultConfig}
              onChange={onConfigChange}
              onDeleteFilter={onDeleteFilter}
              onSaveFilter={saveFilter}
            />
          ) : null}
          <div className={'erda-configurable-filter-body ml-4 pr-2 overflow-auto flex-1'}>
            <Form form={form} layout="vertical" onValuesChange={onValuesChange}>
              <Row>
                {fieldsList
                  ?.filter((item) => !item.outside)
                  ?.map((item, index: number) => {
                    return (
                      <Col span={12} key={item.key} className={index % 2 === 1 ? 'pl-2' : 'pr-2'}>
                        <RenderFormItem
                          required={false}
                          {...defaultProcessField(processField ? processField(item) : item)}
                        />
                      </Col>
                    );
                  })}
              </Row>
            </Form>
          </div>
        </div>

        <div className="erda-configurable-filter-footer flex justify-end mt-3">
          {hideSave ? (
            <Button className="mx-1" onClick={setAllOpen}>
              {i18n.t('clear')}
            </Button>
          ) : isNew && currentConfig ? (
            <Popover
              content={addConfigContent}
              visible={addVisible}
              onVisibleChange={setAddVisible}
              trigger={['click']}
              overlayClassName="erda-configurable-filter-add"
              getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
            >
              <Button
                className="mx-1 cursor-pointer rounded-sm px-2 py-1 flex-h-center"
                onClick={() => setAddVisible(true)}
              >
                <ErdaIcon size={16} fill="white" type="baocun" className="mr-1" /> {i18n.t('dop:new filter')}
              </Button>
            </Popover>
          ) : null}
          <Button className="mx-1" onClick={() => setVisible(false)}>
            {i18n.t('cancel')}
          </Button>
          <Button type="primary" className="ml-1 mr-2 bg-purple-deep border-purple-deep" onClick={onFilter}>
            {i18n.t('common:filter')}
          </Button>
        </div>
      </div>
    </div>
  );
  const getFilterName = () => {
    return getItemByValues(formValue, configList, fieldsList)?.label || i18n.t('common:filter');
  };

  const isAllOpen = !!(
    formValue &&
    !isEmpty(formValue) &&
    Object.keys(formValue).find((key) => formValue[key] && !isEmpty(formValue[key]))
  );

  return (
    <div className={'flex items-center'}>
      <div className="flex-h-center bg-default-06 rounded-sm">
        <Popover
          content={content}
          visible={visible}
          forceRender
          trigger={['click']}
          overlayClassName={`erda-configurable-filter ${hideSave ? 'w-[720px]' : 'w-[960px]'}`}
          placement="bottomLeft"
          onVisibleChange={setVisible}
        >
          <div
            className={`flex-h-center erda-configurable-filter-btn py-1 px-2 rounded-sm leading-none cursor-pointer`}
            onClick={() => setVisible(true)}
          >
            <Badge dot={isAllOpen}>
              <div className="flex-h-center">
                <ErdaIcon type="futaishaixuan" className="filter-icon" size={14} />
                <span className="mx-1 filter-text">{getFilterName()}</span>
              </div>
            </Badge>
            <ErdaIcon type="caret-down" />
          </div>
        </Popover>
        {isAllOpen ? (
          <div
            className="erda-configurable-filter-clear-btn p-1 rounded-sm leading-none cursor-pointer"
            onClick={() => {
              setAllOpen();
              onFilter();
            }}
          >
            <ErdaIcon type="zhongzhi" color="currentColor" size={20} className="relative top-px" />
          </div>
        ) : null}
      </div>

      <div className="flex-h-center">
        {externalField?.map((item) => {
          return (
            <ExternalItem
              itemData={item}
              value={externalValue?.[item.key]}
              onChange={(v) => {
                setExternalValue((prev) => ({ ...prev, [item.key]: v }));
              }}
              key={item.key}
              className="ml-2"
            />
          );
        })}
      </div>
    </div>
  );
};

export default ConfigurableFilter;
