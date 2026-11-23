import { useEffect, useState } from "react";
import { getSecurityReview, updateSecurityReview } from "../api";

function SecurityReviewPanel({
  projectId,
  taskId,
  token,
  taskStatus,
  isReviewer,
  memberMap = {},
  onReviewUpdated
}) {
  const [codeReviewed, setCodeReviewed] = useState(false);
  const [securityTestsPassed, setSecurityTestsPassed] = useState(false);
  const [noUnresolvedVulnerabilities, setNoUnresolvedVulnerabilities] = useState(false);

  const [reviewedBy, setReviewedBy] = useState(null);
  const [reviewedAt, setReviewedAt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const canEdit = isReviewer && taskStatus === "IN_REVIEW";
  const allChecksPassed = codeReviewed && securityTestsPassed && noUnresolvedVulnerabilities;

  useEffect(() => {
    let active = true;

    async function loadReview() {
      setLoading(true);
      setError("");

      try {
        const data = await getSecurityReview(projectId, taskId, token);
        if (!active) return;

        if (data.review) {
          setCodeReviewed(Boolean(data.review.code_reviewed));
          setSecurityTestsPassed(Boolean(data.review.security_tests_passed));
          setNoUnresolvedVulnerabilities(Boolean(data.review.no_unresolved_vulnerabilities));
          setReviewedBy(data.review.reviewed_by);
          setReviewedAt(data.review.reviewed_at);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReview();

    return () => {
      active = false;
    };
  }, [projectId, taskId, token, taskStatus]);

  async function handleSaveReview(e) {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const data = await updateSecurityReview(projectId, taskId, token, {
        codeReviewed,
        securityTestsPassed,
        noUnresolvedVulnerabilities
      });

      if (data.review) {
        setCodeReviewed(Boolean(data.review.code_reviewed));
        setSecurityTestsPassed(Boolean(data.review.security_tests_passed));
        setNoUnresolvedVulnerabilities(Boolean(data.review.no_unresolved_vulnerabilities));
        setReviewedBy(data.review.reviewed_by);
        setReviewedAt(data.review.reviewed_at);
      }

      setSuccessMsg("Security checklist updated and recorded in audit log.");
      if (onReviewUpdated) onReviewUpdated(data.review);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-red-500/30 bg-slate-900/90 p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
              🛡️
            </span>
            <h3 className="text-lg font-bold text-white">Security Review Gate</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Mandatory security verification required before moving this task to DONE.
          </p>
        </div>

        {/* Gate Ready Status Badge */}
        <div>
          {allChecksPassed ? (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
              ✓ Gate Passed (Ready for Approval)
            </span>
          ) : (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
              ⚠️ Gate Incomplete (3 of 3 checks required)
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-xs text-slate-400">Loading security checklist…</p>
      ) : (
        <form onSubmit={handleSaveReview} className="mt-5 space-y-4">
          {/* Status Context Banner */}
          {taskStatus !== "IN_REVIEW" && (
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
              ℹ️ Status is currently <strong className="text-white">{taskStatus}</strong>. Security checklist updates are only permitted while the task is <strong className="text-amber-400">IN_REVIEW</strong>.
            </div>
          )}

          {!isReviewer && (
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
              🔒 Read-only view. Only designated project reviewers (Admin or Project Manager) can check off security requirements.
            </div>
          )}

          {/* Checklist Items */}
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
            {/* Check 1 */}
            <label className={`flex items-start gap-3 text-sm ${canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-80"}`}>
              <input
                type="checkbox"
                disabled={!canEdit || saving}
                checked={codeReviewed}
                onChange={(e) => setCodeReviewed(e.target.checked)}
                className="mt-1 h-4 w-4 accent-emerald-500"
              />
              <div>
                <span className="font-medium text-slate-200">1. Code Review Completed</span>
                <p className="text-xs text-slate-400">
                  Source code has been reviewed by an authorized reviewer and meets security standards.
                </p>
              </div>
            </label>

            {/* Check 2 */}
            <label className={`flex items-start gap-3 text-sm ${canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-80"}`}>
              <input
                type="checkbox"
                disabled={!canEdit || saving}
                checked={securityTestsPassed}
                onChange={(e) => setSecurityTestsPassed(e.target.checked)}
                className="mt-1 h-4 w-4 accent-emerald-500"
              />
              <div>
                <span className="font-medium text-slate-200">2. Security Tests Passed</span>
                <p className="text-xs text-slate-400">
                  Automated security regression tests and test suites have executed successfully.
                </p>
              </div>
            </label>

            {/* Check 3 */}
            <label className={`flex items-start gap-3 text-sm ${canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-80"}`}>
              <input
                type="checkbox"
                disabled={!canEdit || saving}
                checked={noUnresolvedVulnerabilities}
                onChange={(e) => setNoUnresolvedVulnerabilities(e.target.checked)}
                className="mt-1 h-4 w-4 accent-emerald-500"
              />
              <div>
                <span className="font-medium text-slate-200">3. No Unresolved Vulnerabilities</span>
                <p className="text-xs text-slate-400">
                  No high- or critical-severity vulnerabilities or security defects remain unmitigated.
                </p>
              </div>
            </label>
          </div>

          {/* Stamp / Attribution */}
          {reviewedBy && (
            <div className="text-xs text-slate-400">
              Last signed off by:{" "}
              <span className="font-medium text-emerald-400">
                {memberMap[reviewedBy] || `User #${reviewedBy}`}
              </span>{" "}
              {reviewedAt ? `on ${new Date(reviewedAt).toLocaleString()}` : ""}
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}

          {successMsg && (
            <p role="status" className="text-xs text-emerald-400">
              {successMsg}
            </p>
          )}

          {/* Action button */}
          {canEdit && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? "Saving Verification..." : "Save Security Review"}
              </button>
            </div>
          )}
        </form>
      )}
    </section>
  );
}

export default SecurityReviewPanel;
