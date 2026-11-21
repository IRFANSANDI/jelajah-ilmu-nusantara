import { GradeLevel, WorldCurriculum, WorldId } from '../../types/game';
import { GRADE_1_2_CURRICULUM } from './grade1_2';
import { GRADE_3_4_CURRICULUM } from './grade3_4';
import { GRADE_5_6_CURRICULUM } from './grade5_6';

const ALL_CURRICULUM: WorldCurriculum[] = [
  ...GRADE_1_2_CURRICULUM,
  ...GRADE_3_4_CURRICULUM,
  ...GRADE_5_6_CURRICULUM,
];

export function getWorldCurriculum(grade: GradeLevel, worldId: WorldId): WorldCurriculum {
  const found = ALL_CURRICULUM.find(
    (item) => item.grade === grade && item.worldId === worldId
  );
  if (found) return found;
  return ALL_CURRICULUM[0];
}

export function getGradeCurriculumList(grade: GradeLevel): WorldCurriculum[] {
  return ALL_CURRICULUM.filter((item) => item.grade === grade);
}
