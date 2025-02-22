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
import { Menu, Tooltip, Dropdown, Avatar, Checkbox } from 'antd';
import { isEmpty, isString, map } from 'lodash';
import { Ellipsis, ErdaIcon, Badge, Tags } from 'common';
import { getAvatarChars } from 'common/utils';
import ImgMap, { getImg } from 'app/config-page/img-map';
import { iconMap } from 'common/components/erda-icon';
import i18n from 'i18n';
import { useUserMap } from 'core/stores/userMap';

const getLogo = (logo: string, logoCircle?: boolean) => {
  if (Object.keys(ImgMap).includes(logo)) {
    return (
      <div>
        <img src={getImg(logo)} className={`${logoCircle ? 'prefix-img-circle' : ''}`} />
      </div>
    );
  } else if (Object.keys(iconMap).includes(logo)) {
    return <ErdaIcon disableCurrent type={logo} size="76" className={`${logoCircle ? 'prefix-img-circle' : ''}`} />;
  } else {
    return (
      <div>
        <img src={logo} className={`rounded-sm ${logoCircle ? 'prefix-img-circle' : ''}`} />
      </div>
    );
  }
};

const ListItem = (props: ERDA_LIST.ItemProps) => {
  const { data, columnsInfoWidth, defaultLogo = '', defaultBgImg = '', onSelectChange } = props;
  const {
    logoURL,
    title,
    icon,
    titleSummary,
    selected,
    selectable = true,
    titleState,
    mainState,
    tags,
    titlePrefixIcon,
    logoCircle,
    titlePrefixIconTip,
    titleSuffixIcon,
    titleSuffixIconTip,
    description,
    kvInfos,
    columnsInfo,
    extra,
    backgroundImg,
    operations,
    moreOperations,
    itemProps,
  } = data || {};

  const menuOverlay = moreOperations?.length ? (
    <Menu style={{ minWidth: 80 }}>
      {moreOperations.map((action) => {
        const { key, text, onClick } = action;
        return (
          <Menu.Item key={key} onClick={(item) => onClick?.(item.domEvent as any)}>
            {text}
          </Menu.Item>
        );
      })}
    </Menu>
  ) : null;
  const userMap = useUserMap();

  const curLogo = logoURL || defaultLogo;
  return (
    <div
      className={`erda-base-list-item cursor-pointer`}
      {...itemProps}
      style={backgroundImg || defaultBgImg ? { backgroundImage: `url(${getImg(backgroundImg || defaultBgImg)})` } : {}}
    >
      <div className="erda-base-list-item-container">
        <div className="flex">
          {onSelectChange ? (
            <Checkbox
              className="flex items-center mr-4"
              disabled={!selectable}
              checked={selected}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onSelectChange(e.target.checked)}
            />
          ) : null}
          {mainState && (curLogo || icon) ? <Badge onlyDot {...mainState} /> : null}
          {curLogo ? (
            <div className="item-prefix-img flex items-center">
              {isString(curLogo) ? getLogo(curLogo, logoCircle) : curLogo}
            </div>
          ) : null}
          {icon ? (
            <div className="item-prefix-img flex items-center">
              <ErdaIcon disableCurrent type={icon} size={28} />
            </div>
          ) : null}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col justify-center overflow-hidden">
              <div className="body-title">
                {mainState && !(curLogo || icon) ? <Badge className="" onlyDot {...mainState} /> : null}
                {titlePrefixIcon && (
                  <Tooltip title={titlePrefixIconTip}>
                    <ErdaIcon type={titlePrefixIcon} className="title-icon mr-2" />
                  </Tooltip>
                )}
                <Ellipsis className=" title-text text-base text-default hover:text-purple-deep" title={title} />
                {titleSummary ? (
                  <span className="inline-block ml-1 bg-default-1 px-1.5 rounded-lg text-default-8 text-xs leading-5">
                    {titleSummary}
                  </span>
                ) : null}
                {titleSuffixIcon && (
                  <Tooltip title={titleSuffixIconTip}>
                    <ErdaIcon type={titleSuffixIcon} className="title-icon ml-2" />
                  </Tooltip>
                )}
                {map(titleState, (item, idx) => (
                  <Badge key={idx} showDot={false} size="small" {...item} className="ml-2" />
                ))}
                {tags ? <Tags labels={tags} containerClassName="ml-2" /> : null}
              </div>
              <If condition={description !== undefined}>
                <Ellipsis className={`body-description ${kvInfos?.length ? '' : 'mt-1'}`} title={description || '-'} />
              </If>
              <If condition={!!kvInfos?.length}>
                <div className="body-meta-info flex mt-2">
                  {map(kvInfos, (info) => {
                    const { compWapper, status = 'default' } = info;

                    const Comp = (
                      <span className={`info-item type-${info.type || 'normal'}`} {...info.extraProps}>
                        {info.icon ? (
                          <ErdaIcon type={info.icon} isConfigPageIcon size="14" />
                        ) : (
                          <span className="info-text truncate">{info.key}</span>
                        )}
                        <span className={`info-value truncate ml-1 info-value-${status}`}>{info.value}</span>
                      </span>
                    );
                    if (compWapper) {
                      return compWapper(Comp);
                    }

                    return (
                      <Tooltip
                        key={info.key}
                        title={
                          <div>
                            {info.tip?.split('\n').map((item) => (
                              <>
                                {item}
                                <br />
                              </>
                            ))}
                          </div>
                        }
                      >
                        {Comp}
                      </Tooltip>
                    );
                  })}
                </div>
              </If>
            </div>
            {columnsInfo ? (
              <div className="flex items-center">
                {columnsInfo.hoverIcons ? (
                  <div className="erda-base-list-item-hover-icons">
                    <div className="mr-4 flex ">
                      {columnsInfo.hoverIcons.map((item, idx) => {
                        const { compWapper } = item;
                        if (compWapper) {
                          return compWapper(
                            <ErdaIcon
                              {...item}
                              type={item.icon}
                              size={20}
                              className={`text-default-4 hover:text-default-8 ${idx !== 0 ? 'ml-4' : ''}`}
                            />,
                          );
                        }
                        return (
                          <Tooltip title={item.tip} key={idx}>
                            <ErdaIcon
                              type={item.icon}
                              size={20}
                              {...item.extraProps}
                              className={`text-default-4 hover:text-default-8 ${idx !== 0 ? 'ml-4' : ''}`}
                            />
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {columnsInfo.state ? (
                  <div className="ml-6" style={{ width: columnsInfoWidth?.state || 80 }}>
                    <Badge showDot={false} {...columnsInfo.state} />
                  </div>
                ) : null}
                {columnsInfo.users ? (
                  <div className="ml-6 flex items-center" style={{ width: columnsInfoWidth?.users || 80 }}>
                    {columnsInfo.users.map((item) => {
                      const curUser = userMap[item] || {};
                      return (
                        <div key={item} className="truncate">
                          <Avatar src={curUser?.avatar} size="small">
                            {curUser?.nick ? getAvatarChars(curUser.nick) : i18n.t('none')}
                          </Avatar>
                          <span className="ml-1" title={curUser?.name || item}>
                            {curUser?.nick || curUser?.name || i18n.t('common:none')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {columnsInfo.text ? (
                  <div className="ml-6 flex items-center" style={{ width: columnsInfoWidth?.text || 80 }}>
                    {columnsInfo.text.map((item, idx) => {
                      return (
                        <Tooltip title={item.tip} key={idx}>
                          <div className="text-default-4">{item.text}</div>
                        </Tooltip>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="flex items-center">
              {selectable ? (
                menuOverlay || operations?.length ? (
                  <div
                    className={`flex items-center ${!isEmpty(extra) ? 'self-start' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {map(operations, (action, idx) => {
                      const { compWapper, ...restAction } = action;
                      if (compWapper) {
                        return compWapper(<ErdaIcon {...restAction} type={action.icon} className="mr-4" size={18} />);
                      }
                      return (
                        <Tooltip title={action.tip} key={idx}>
                          <ErdaIcon
                            {...restAction}
                            type={action.icon}
                            className="mr-4"
                            size={18}
                            onClick={action?.onClick}
                          />
                        </Tooltip>
                      );
                    })}
                    {menuOverlay && (
                      <Dropdown
                        overlay={menuOverlay}
                        overlayClassName={'erda-list-operations'}
                        overlayStyle={{ zIndex: 1000 }}
                      >
                        <ErdaIcon
                          type="more"
                          size={18}
                          className="list-item-more hover-active p-1 rounded hover:bg-black-02"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Dropdown>
                    )}
                  </div>
                ) : null
              ) : (
                <ErdaIcon type="lock" size={18} className="text-default-2" onClick={(e) => e.stopPropagation()} />
              )}
            </div>
          </div>
        </div>

        <If condition={!isEmpty(extra)}>
          <div className="py-1">{extra}</div>
        </If>
      </div>
    </div>
  );
};

export default ListItem;
