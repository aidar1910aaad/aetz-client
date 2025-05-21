'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea';
  required?: boolean;
}

interface ModalData {
  title?: string;
  initialValues: Record<string, string>;
  fields: Field[];
}

let resolveModal: (value: Record<string, string> | null) => void;

export const showEditModal = ({
  title,
  initialValues,
  fields,
}: ModalData): Promise<Record<string, string> | null> => {
  const event = new CustomEvent('open-edit-modal', {
    detail: { title, initialValues, fields },
  });
  window.dispatchEvent(event);

  return new Promise((resolve) => {
    resolveModal = resolve;
  });
};

export default function EditModalContainer() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [title, setTitle] = useState('Редактировать');
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    const handler = (e: any) => {
      setTitle(e.detail?.title || 'Редактировать');
      setInitialValues(e.detail?.initialValues || {});
      setValues(e.detail?.initialValues || {});
      setFields(e.detail?.fields || []);
      setOpen(true);
    };
    window.addEventListener('open-edit-modal', handler);
    return () => window.removeEventListener('open-edit-modal', handler);
  }, []);

  const handleCancel = () => {
    setOpen(false);
    resolveModal(null);
  };

  const handleSave = () => {
    setOpen(false);
    resolveModal(values);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleCancel();
  };

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return fields.every((field) => {
      if (!field.required) return true;
      return values[field.name]?.trim() !== '';
    });
  };

  const hasChanges = () => {
    return Object.keys(values).some(
      (key) => values[key]?.trim() !== initialValues[key]?.trim()
    );
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md text-sm">
        <h2 className="text-lg font-semibold mb-4 text-black">{title}</h2>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded text-black focus:outline-[#3A55DF]"
                  rows={3}
                />
              ) : (
                <input
                  type="text"
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded text-black focus:outline-[#3A55DF]"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 text-black"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid() || !hasChanges()}
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
