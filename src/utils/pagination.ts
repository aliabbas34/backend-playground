
interface PaginationOffset {
  skip: number;
  take: number;
}

/**
 * Calculates Database pagination parameters (skip and take) from 1-based page numbers.
 */
export function getPaginationOffset(
  page: number,
  limit: number,
): PaginationOffset {
    const take = limit;
    const skip = (page - 1) * take;

    return { skip, take };
}