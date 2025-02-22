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

import classnames from 'classnames';
import React from 'react';
import { Icon as CustomIcon } from 'common';
import i18n from 'i18n';
import './index.scss';

interface IEmptyProps {
  tip?: string;
  desc?: string;
  icon?: string | JSX.Element;
  relative?: boolean;
  style?: object;
  direction?: 'col' | 'row';
  action?: JSX.Element | null;
  className?: string;
  // save svg to static/empty-holder directory, use https://www.zhangxinxu.com/sp/svgo/ to compress first
  scene?: 'create-project' | 'create-app' | 'upload' | 'star-project' | 'star-app' | 'empty-message';
}
export const EmptyHolder = ({
  icon = 'empty',
  tip = i18n.t('common:no data'),
  desc,
  direction = 'col',
  relative = false,
  style = {},
  action = null,
  className = '',
  scene,
}: IEmptyProps) => {
  const cls = classnames({
    'empty-holder': true,
    'multi-line': true,
    relative,
  });
  if (scene) {
    const imgPath = process.env.NODE_ENV === 'production' ? '/static/shell' : '/app';
    return (
      <div
        className={`scene-empty-holder inline-flex items-center justify-center bg-default-02 ${className || ''} ${
          direction === 'col' ? 'flex-col' : ''
        }`}
        style={style}
      >
        <img src={`${imgPath}/images/empty-holder/${scene}.svg`} alt={`${scene}-empty-image`} />
        {tip || desc ? (
          <div className={`${direction === 'col' ? 'mt-4' : 'ml-4'}`}>
            <div className={`title font-medium ${direction === 'col' ? 'text-center' : ''}`}>{tip}</div>
            <div className="desc text-sub">{desc}</div>
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div className={`${cls} ${className}`} style={style}>
      {typeof icon === 'string' ? <CustomIcon className="w-full" type={icon} color /> : <div>{icon}</div>}
      <span>
        {tip} <span className="action">{action}</span>
      </span>
    </div>
  );
};

export default EmptyHolder;
