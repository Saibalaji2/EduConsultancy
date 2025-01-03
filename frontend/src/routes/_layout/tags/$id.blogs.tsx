import { createFileRoute } from '@tanstack/react-router'
import {useInView} from "react-intersection-observer";
import {useInfiniteQuery} from "@tanstack/react-query";
import { fetchBlogsByTagId} from "@/service/blogs.ts";
import {useEffect} from "react";
import BlogLayout from "@/components/BlogLayout.tsx";
import {BlogPageResponse, BlogSummary} from "@/types/blogTypes.ts";
import {BlogPostCard} from "@/components/BlogPostCard.tsx";

export const Route = createFileRoute('/_layout/tags/$id/blogs')({
  component: RouteComponent,
})

function RouteComponent() {
  const {ref,inView} = useInView();
  const {id} = Route.useParams();

  const { data, isLoading,isError,fetchNextPage } = useInfiniteQuery({
    queryKey: ["blogs", 'tags',id],
    queryFn: async ({ pageParam = 0 }) => fetchBlogsByTagId(pageParam,id),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // if (lastPage.currentPage +1 < lastPage.totalPages) {
      //   return lastPage.currentPage + 1; // Fetch the next page
      // }
      if (lastPage.hasNext) {
        return lastPage.currentPage + 1; // Fetch the next page
      }
      return undefined; // No more pages to fetch
    },
    staleTime: 60000, // Data considered fresh for 5 minutes
    refetchInterval: 60000, // Refresh every 5 minutes
    refetchIntervalInBackground: true, // Refresh even when the tab is in the background
  });

  useEffect(() => {
    if(inView){
      fetchNextPage();
    }
  }, [fetchNextPage,inView]);

  if(isLoading){
    return <div className="text-center">Loading...</div>;
  }
  if(isError){
    return (<div className="text-center text-red-600">There was an error</div>)
  }



  return (
      <BlogLayout>
        <div className="space-y-2">
          {data?.pages?.map((page:BlogPageResponse) => {
            return page?.blogs.map((post:BlogSummary) => {
              return <BlogPostCard post={post} key={post.id}/>
            })
          })}
        </div>
        <div ref={ref}>

        </div>
      </BlogLayout>
  )
}