import { fetchCoursesApi } from "@/src/actions/course/courseApi"; // Pastikan fungsi ini bisa jalan di server
import ListCourse from "@/src/features/course/CourseTable";

export default async function CoursePage() {
  
  const courses = await fetchCoursesApi();

  return (
    <div>
      <ListCourse initialData={courses} />
    </div>
  );
}
