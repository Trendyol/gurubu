import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select, {
  ActionMeta,
  InputActionMeta,
  MultiValue,
} from "react-select";
import debounce from "lodash.debounce";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useSocket } from "@/contexts/SocketContext";
import { useToast } from "@/contexts/ToastContext";
import { JiraService } from "@/services/jiraService";
import { SelectOption } from "./filterable-select";

interface IssueLabelsProps {
  roomId: string;
  issueId: string;
  labels?: string[];
}

export const IssueLabels: React.FC<IssueLabelsProps> = ({
  roomId,
  issueId,
  labels,
}) => {
  const { userInfo, groomingInfo } = useGroomingRoom();
  const socket = useSocket();
  const { showSuccessToast, showFailureToast } = useToast();
  const isAdmin = Boolean(userInfo?.lobby?.isAdmin);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const issueLabels = labels || [];

  const jiraService = useMemo(
    () => new JiraService(process.env.NEXT_PUBLIC_API_URL || ""),
    []
  );

  const selectedOptions = useMemo(
    () => issueLabels.map((label) => ({ value: label, label })),
    [issueLabels]
  );

  const syncLabels = useCallback(
    (nextLabels: string[]) => {
      const updatedIssues = groomingInfo.issues.map((issue) =>
        issue.id === issueId ? { ...issue, labels: nextLabels } : issue
      );
      socket.emit(
        "setIssues",
        roomId,
        updatedIssues,
        userInfo.lobby.credentials
      );
    },
    [groomingInfo.issues, issueId, roomId, socket, userInfo.lobby.credentials]
  );

  const loadOptions = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setOptions([]);
        return;
      }

      setIsLoading(true);
      const response = await jiraService.searchLabels(trimmed);
      if (response.isSuccess && response.data) {
        const existing = new Set(issueLabels);
        setOptions(
          response.data
            .filter((label) => !existing.has(label))
            .map((label) => ({ value: label, label }))
        );
      } else {
        setOptions([]);
      }
      setIsLoading(false);
    },
    [jiraService, issueLabels]
  );

  const debouncedLoadOptions = useMemo(
    () => debounce((query: string) => {
      void loadOptions(query);
    }, 300),
    [loadOptions]
  );

  useEffect(() => {
    return () => {
      debouncedLoadOptions.cancel();
    };
  }, [debouncedLoadOptions]);

  const handleInputChange = (value: string, actionMeta: InputActionMeta) => {
    if (actionMeta.action === "input-change") {
      setInputValue(value);
      debouncedLoadOptions(value);
    }
    return value;
  };

  const addLabel = async (labelToAdd: string) => {
    const response = await jiraService.updateIssueLabels(issueId, {
      add: labelToAdd,
    });

    if (response.isSuccess) {
      syncLabels(Array.from(new Set([...issueLabels, labelToAdd])));
      showSuccessToast(
        "Label Added",
        `"${labelToAdd}" was added to the issue.`,
        "top-right"
      );
      setInputValue("");
      setOptions([]);
    } else {
      showFailureToast(
        "Label Add Failed",
        "Could not add label. Please try again.",
        "top-right"
      );
    }
  };

  const removeLabel = async (labelToRemove: string) => {
    const response = await jiraService.updateIssueLabels(issueId, {
      remove: labelToRemove,
    });

    if (response.isSuccess) {
      syncLabels(issueLabels.filter((label) => label !== labelToRemove));
      showSuccessToast(
        "Label Removed",
        `"${labelToRemove}" was removed from the issue.`,
        "top-right"
      );
    } else {
      showFailureToast(
        "Label Remove Failed",
        "Could not remove label. Please try again.",
        "top-right"
      );
    }
  };

  const handleChange = async (
    _value: MultiValue<SelectOption>,
    actionMeta: ActionMeta<SelectOption>
  ) => {
    if (!isAdmin || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (actionMeta.action === "select-option" && actionMeta.option) {
        await addLabel(String(actionMeta.option.value));
      } else if (
        (actionMeta.action === "remove-value" ||
          actionMeta.action === "pop-value") &&
        actionMeta.removedValue
      ) {
        await removeLabel(String(actionMeta.removedValue.value));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grooming-board-issue-labels">
      <label>Labels</label>
      <div className="issue-labels-content">
        {isAdmin ? (
          <div className="issue-labels-select">
            <Select<SelectOption, true>
              isMulti
              classNamePrefix="issue-labels-select"
              options={options}
              value={selectedOptions}
              inputValue={inputValue}
              onInputChange={handleInputChange}
              onChange={handleChange}
              isDisabled={isSubmitting}
              isLoading={isLoading}
              isClearable={false}
              isSearchable
              backspaceRemovesValue={false}
              placeholder="Search existing labels..."
              noOptionsMessage={() =>
                inputValue.trim()
                  ? "No matching labels"
                  : "Type to search labels"
              }
              filterOption={null}
              components={{
                IndicatorSeparator: () => null,
              }}
              aria-label="Issue labels from existing Jira labels"
            />
          </div>
        ) : (
          <div className="issue-labels-chips">
            {issueLabels.length === 0 && (
              <span className="issue-labels-empty">No labels</span>
            )}
            {issueLabels.map((label) => (
              <span key={label} className="issue-label-chip">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueLabels;
