"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Modal,
  TextField,
  Label,
  InputGroup,
  TextArea,
  Button,
} from "@heroui/react";
import { ControlledModal } from "@/components/ui/ControlledModal";
import { message } from "@/lib/toast";
import { getApiErrorMessage } from "@/lib/api-error";
import type { TestCase, TestCaseFormValues, ModalMode } from "@/types/app/testCase";

function TagInput({
  value = [],
  onChange,
  disabled,
}: {
  value?: string[];
  onChange?: (v: string[]) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("testCaseModal");
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) onChange?.([...value, tag]);
    setInput("");
  };

  return (
    <div
      className={`border border-gray-300 dark:border-[#3e3e42] rounded-md p-1 flex flex-wrap gap-1 min-h-9 ${
        disabled ? "bg-gray-100 dark:bg-[#2d2d2d]" : "bg-white dark:bg-[#1e1e1e]"
      }`}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="bg-gray-100 dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#3e3e42] rounded px-2 py-0.5 text-sm inline-flex items-center gap-1.5"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange?.(value.filter((x) => x !== tag))}
              className="cursor-pointer text-gray-400 text-xs leading-none"
            >
              ×
            </button>
          )}
        </span>
      ))}
      {!disabled && (
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            } else if (e.key === "Backspace" && !input && value.length > 0) {
              onChange?.(value.slice(0, -1));
            }
          }}
          onBlur={addTag}
          placeholder={value.length === 0 ? t("tagPlaceholder") : ""}
          className="border-none outline-none flex-1 min-w-[120px] text-sm bg-transparent py-0.5"
        />
      )}
    </div>
  );
}

interface TestCaseModalProps {
  open: boolean;
  mode: ModalMode;
  folderId?: string | null;
  data?: TestCase | null;
  onClose: () => void;
  onCreate: (values: TestCaseFormValues) => Promise<void>;
  onUpdate: (id: string, values: Partial<TestCaseFormValues>) => Promise<void>;
  isLoading: boolean;
}

export default function TestCaseModal({
  open,
  mode,
  folderId,
  data,
  onClose,
  onCreate,
  onUpdate,
  isLoading,
}: TestCaseModalProps) {
  const t = useTranslations("testCaseModal");
  const isView = mode === "view";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      if (data) {
        setTitle(data.title);
        setDescription(data.description ?? "");
        setExpectedResult(data.expectedResult ?? "");
        setTags(data.tags ?? []);
      } else {
        setTitle("");
        setDescription("");
        setExpectedResult("");
        setTags([]);
      }
    }
  }, [open, data]);

  const handleOk = async () => {
    if (!title.trim()) {
      message.warning(t("titleRequired"));
      return;
    }
    const values: TestCaseFormValues = {
      title: title.trim(),
      description: description || undefined,
      expectedResult: expectedResult || undefined,
      testType: data?.testType ?? "manual",
      status: data?.status ?? "not_tested",
      priority: data?.priority ?? "medium",
      tags,
      folderId: data?.folderId ?? folderId ?? undefined,
    };
    try {
      if (mode === "edit" && data) {
        await onUpdate(data.id, values);
        message.success(t("updateSuccess"));
      } else {
        await onCreate(values);
        message.success(t("createSuccess"));
      }
      onClose();
    } catch (error) {
      message.error(getApiErrorMessage(error, t("error")));
    }
  };

  const modalTitle =
    mode === "create" ? t("titleCreate") : mode === "edit" ? t("titleEdit") : t("titleView");

  return (
    <ControlledModal open={open} onClose={onClose}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{modalTitle}</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <TextField value={title} onChange={setTitle} isRequired isDisabled={isView}>
                <Label>{t("nameLabel")}</Label>
                <InputGroup>
                  <InputGroup.Input placeholder={t("namePlaceholder")} />
                </InputGroup>
              </TextField>

              <div className="flex flex-col gap-1">
                <Label>{t("descLabel")}</Label>
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isView}
                  rows={3}
                  placeholder={t("descPlaceholder")}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>{t("expectedLabel")}</Label>
                <TextArea
                  value={expectedResult}
                  onChange={(e) => setExpectedResult(e.target.value)}
                  disabled={isView}
                  rows={3}
                  placeholder={t("expectedPlaceholder")}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>{t("tagsLabel")}</Label>
                <TagInput value={tags} onChange={setTags} disabled={isView} />
              </div>
            </Modal.Body>
            <Modal.Footer>
              {isView ? (
                <Button slot="close" variant="secondary">
                  {t("close")}
                </Button>
              ) : (
                <>
                  <Button slot="close" variant="secondary">
                    {t("cancel")}
                  </Button>
                  <Button variant="primary" isDisabled={isLoading} onPress={handleOk}>
                    {isLoading ? t("saving") : t("save")}
                  </Button>
                </>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </ControlledModal>
  );
}
