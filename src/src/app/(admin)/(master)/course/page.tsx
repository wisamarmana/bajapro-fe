import ListCourse  from "@/src/components/features/course/CourseTable";
import { fetchCoursesApi } from "@/src/actions/course/courseApi"; // Pastikan fungsi ini bisa jalan di server

export default async function CoursePage() {
  
  const courses = await fetchCoursesApi();

  return (
    <div>
      <ListCourse initialData={courses} />
    </div>
  );
}
