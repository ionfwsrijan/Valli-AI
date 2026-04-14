from app.policy_rag import retrieve_policy_answer


def test_fasting_answer_is_time_aware_for_day_before_question() -> None:
    result = retrieve_policy_answer("Can I drink water the day before surgery?")

    assert "Fasting Instructions" in result["sources"]
    answer = result["answer"].lower()
    assert "depends on how soon" in answer
    assert "day before surgery is different" in answer
    assert "blanket yes or no" in answer
    assert "2 hours" in answer


def test_fasting_answer_warns_against_solid_food_in_final_window() -> None:
    result = retrieve_policy_answer("Can I eat pizza? I have surgery in an hour.")

    assert "Fasting Instructions" in result["sources"]
    answer = result["answer"].lower()
    assert "pizza" in answer
    assert "should not be eaten now" in answer
