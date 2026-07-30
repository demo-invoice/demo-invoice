import React, { type RefObject } from 'react';
import type { LineItem } from '../../context/InvoiceContext';

interface Props {
  addItemButtonRef?: React.RefObject<HTMLButtonElement>;
  item: LineItem;
  index: number;
}

export function LineItemListItem({ item, index }: Props) {
  return (
    <div>
      <span>{index + 1}. {item.description}</span>
    </div>
  );
}
