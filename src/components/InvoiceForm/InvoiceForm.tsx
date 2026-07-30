import { useInvoiceState, useInvoiceDispatch } from '../../context/InvoiceContext';
import type { LineItem } from '../../types/invoice';

export function InvoiceForm(): JSX.Element {
  const state = useInvoiceState();
  const dispatch = useInvoiceDispatch();

  function handleMetaChange(field: string, value: string) {
    dispatch({ type: 'SET_META', payload: { [field]: value } as any });
  }

  function handleSenderChange(field: string, value: string) {
    dispatch({ type: 'SET_SENDER', payload: { [field]: value } as any });
  }

  function handleClientChange(field: string, value: string) {
    dispatch({ type: 'SET_CLIENT', payload: { [field]: value } as any });
  }

  function handleNotesChange(value: string) {
    dispatch({ type: 'SET_NOTES', payload: value });
  }

  function handleLineItemChange(index: number, field: keyof LineItem, value: string | number) {
    const updated = state.lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    dispatch({ type: 'SET_LINE_ITEMS', payload: updated });
  }

  function handleAddLineItem() {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    dispatch({ type: 'SET_LINE_ITEMS', payload: [...state.lineItems, newItem] });
  }

  function handleRemoveLineItem(index: number) {
    const updated = state.lineItems.filter((_, i) => i !== index);
    dispatch({ type: 'SET_LINE_ITEMS', payload: updated });
  }

  return (
    <form>
      <section>
        <h2>Invoice Details</h2>
        <label>
          Invoice Number
          <input
            type="text"
            value={state.meta.invoiceNumber}
            onChange={e => handleMetaChange('invoiceNumber', e.target.value)}
          />
        </label>
        <label>
          Issue Date
          <input
            type="date"
            value={state.meta.issueDate}
            onChange={e => handleMetaChange('issueDate', e.target.value)}
          />
        </label>
        <label>
          Due Date
          <input
            type="date"
            value={state.meta.dueDate}
            onChange={e => handleMetaChange('dueDate', e.target.value)}
          />
        </label>
        <label>
          Currency
          <input
            type="text"
            value={state.meta.currency}
            onChange={e => handleMetaChange('currency', e.target.value)}
          />
        </label>
        <label>
          Tax Rate (%)
          <input
            type="number"
            value={state.meta.taxRate}
            onChange={e => handleMetaChange('taxRate', e.target.value)}
          />
        </label>
      </section>

      <section>
        <h2>Sender Details</h2>
        <label>
          Name
          <input
            type="text"
            value={state.sender.name}
            onChange={e => handleSenderChange('name', e.target.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={state.sender.email}
            onChange={e => handleSenderChange('email', e.target.value)}
          />
        </label>
        <label>
          Address Line 1
          <input
            type="text"
            value={state.sender.addressLine1}
            onChange={e => handleSenderChange('addressLine1', e.target.value)}
          />
        </label>
        <label>
          Address Line 2
          <input
            type="text"
            value={state.sender.addressLine2}
            onChange={e => handleSenderChange('addressLine2', e.target.value)}
          />
        </label>
        <label>
          City
          <input
            type="text"
            value={state.sender.city}
            onChange={e => handleSenderChange('city', e.target.value)}
          />
        </label>
        <label>
          State
          <input
            type="text"
            value={state.sender.state}
            onChange={e => handleSenderChange('state', e.target.value)}
          />
        </label>
        <label>
          ZIP
          <input
            type="text"
            value={state.sender.zip}
            onChange={e => handleSenderChange('zip', e.target.value)}
          />
        </label>
        <label>
          Phone
          <input
            type="tel"
            value={state.sender.phone}
            onChange={e => handleSenderChange('phone', e.target.value)}
          />
        </label>
      </section>

      <section>
        <h2>Client Details</h2>
        <label>
          Name
          <input
            type="text"
            value={state.client.name}
            onChange={e => handleClientChange('name', e.target.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={state.client.email}
            onChange={e => handleClientChange('email', e.target.value)}
          />
        </label>
        <label>
          Address Line 1
          <input
            type="text"
            value={state.client.addressLine1}
            onChange={e => handleClientChange('addressLine1', e.target.value)}
          />
        </label>
        <label>
          Address Line 2
          <input
            type="text"
            value={state.client.addressLine2}
            onChange={e => handleClientChange('addressLine2', e.target.value)}
          />
        </label>
        <label>
          City
          <input
            type="text"
            value={state.client.city}
            onChange={e => handleClientChange('city', e.target.value)}
          />
        </label>
        <label>
          State
          <input
            type="text"
            value={state.client.state}
            onChange={e => handleClientChange('state', e.target.value)}
          />
        </label>
        <label>
          ZIP
          <input
            type="text"
            value={state.client.zip}
            onChange={e => handleClientChange('zip', e.target.value)}
          />
        </label>
      </section>

      <section>
        <h2>Line Items</h2>
        {state.lineItems.map((item, index) => (
          <div key={item.id}>
            <input
              type="text"
              placeholder="Description"
              value={item.description}
              onChange={e => handleLineItemChange(index, 'description', e.target.value)}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={e => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
            />
            <input
              type="number"
              placeholder="Unit Price"
              value={item.unitPrice}
              onChange={e => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
            />
            <button type="button" onClick={() => handleRemoveLineItem(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={handleAddLineItem}>Add Line Item</button>
      </section>

      <section>
        <h2>Notes</h2>
        <textarea
          value={state.notes}
          onChange={e => handleNotesChange(e.target.value)}
        />
      </section>
    </form>
  );
}
