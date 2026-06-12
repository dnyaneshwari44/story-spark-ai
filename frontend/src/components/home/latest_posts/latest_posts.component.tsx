import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetLatestListsQuery } from "../../../redux/apis/post.api";
import { Post } from "../../../models/post";
import LoadingAnimation from "../../loading/loading.component";

const LatestPostsComponent = () => {
  const { data, isLoading, isError, refetch } =
    useGetLatestListsQuery(undefined);

  const navigate = useNavigate();

  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  if (isLoading) return <LoadingAnimation />;

  if (isError) {
    return (
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Latest Posts
        </h2>

        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-5 text-center text-red-200">
          <p className="mb-3 font-semibold">Failed to load latest posts.</p>

          <button
            onClick={() => refetch()}
            className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const seenIds = new Set<string>();

  const uniquePosts = (data?.posts ?? []).filter((post: Post) => {
    if (!post?._id || seenIds.has(post._id)) return false;

    seenIds.add(post._id);
    return true;
  });

  const toggleAccordion = (postId: string) => {
    setExpandedPostId((prevId) =>
      prevId === postId ? null : postId
    );
  };

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
        Latest Posts
      </h2>

      <div className="space-y-3">
        {uniquePosts.length > 0 ? (
          uniquePosts.map((post: Post) => {
            const isExpanded = expandedPostId === post._id;

            return (
              <div
                key={post._id}
                className="motion-card-subtle rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-200 dark:border-slate-700 dark:bg-slate-900"
              >
                <button
                  onClick={() => toggleAccordion(post._id)}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-slate-900 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="pr-4 text-lg md:text-xl">
                    {post.title}
                  </span>

                  <span className="select-none font-mono text-sm text-slate-500 transition-transform duration-200 dark:text-slate-400">
                    {isExpanded ? "▼" : "▶"}
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? "max-h-[500px] border-t border-slate-200 dark:border-slate-700"
                      : "max-h-0"
                  }`}
                >
                  <div className="bg-slate-50 p-5 dark:bg-slate-800/50">
                    <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300 md:text-base">
                      {post.content || "No preview content available."}
                    </p>

                    <div className="flex justify-end">
                      <button
                        onClick={() => navigate(`/post/${post._id}`)}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                      >
                        Read Full Story
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-slate-500 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-400">
            Posts are not available.
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestPostsComponent;