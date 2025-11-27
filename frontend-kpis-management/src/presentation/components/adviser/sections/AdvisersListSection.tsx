import { Adviser } from "../../../../core/domain/Adviser/Adviser";
import { AdviserCard } from "../cards/AdviserCard";

interface Props {
    advisers: Adviser[];
}

export default function AdvisersListSection({ advisers }: Props) {
  return (
    <>
      {advisers.map(adviser => (
        <AdviserCard key={adviser.id} adviser={adviser} />
      ))}
    </>
  );
}