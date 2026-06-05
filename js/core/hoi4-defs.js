// ════════════════════════════════════════════════════════
//  hoi4-defs.js — HOI4 Effect / Trigger / Modifier / Scope 정의 라이브러리
//  출처: Hearts of Iron 4 Wiki (자동 파싱 + 수동 보강)
//  의존: 없음 (순수 데이터)
// ════════════════════════════════════════════════════════

// param type 종류:
//   number       — 정수 (add_political_power = 100)
//   float        — 소수 (add_stability = 0.1)
//   bool         — yes/no
//   string       — 문자열 (큰따옴표 없이)
//   country_tag  — GER, SOV 등 3자리 태그
//   state_id     — 상태 ID (정수)
//   ideology     — democratic/fascism/communism/neutrality
//   idea_token   — 아이디어 ID
//   localisation_key — 현지화 키
//   event_id     — my_country.1 형식
//   comparison   — "> 100", "< 0.5" 형식
//   scope_block  — 중첩 블록 { ... }
//   tech_tokens  — 기술 토큰 (여러 개)

const HOI4_EFFECTS = [
    {
        key: "add_political_power",
        params: [{"name": "value", "type": "number", "default": 100}],
    },
    {
        key: "add_manpower",
        params: [{"name": "value", "type": "number", "default": 10000}],
    },
    {
        key: "add_stability",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "add_war_support",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "add_fuel",
        params: [{"name": "value", "type": "number", "default": 1000}],
    },
    {
        key: "add_equipment_to_stockpile",
        params: [{"name": "type", "type": "string"}, {"name": "amount", "type": "number", "default": 100}, {"name": "producer", "type": "country_tag"}],
    },
    {
        key: "set_stability",
        params: [{"name": "value", "type": "float", "default": 0.5}],
    },
    {
        key: "set_war_support",
        params: [{"name": "value", "type": "float", "default": 0.5}],
    },
    {
        key: "country_event",
        params: [{"name": "id", "type": "event_id", "required": true}, {"name": "days", "type": "number", "default": 0}],
    },
    {
        key: "news_event",
        params: [{"name": "id", "type": "event_id", "required": true}, {"name": "days", "type": "number", "default": 0}],
    },
    {
        key: "add_ideas",
        params: [{"name": "value", "type": "idea_token"}],
    },
    {
        key: "remove_ideas",
        params: [{"name": "value", "type": "idea_token"}],
    },
    {
        key: "swap_ideas",
        params: [{"name": "remove_idea", "type": "idea_token"}, {"name": "add_idea", "type": "idea_token"}],
    },
    {
        key: "add_timed_idea",
        params: [{"name": "idea", "type": "idea_token"}, {"name": "days", "type": "number", "default": 30}],
    },
    {
        key: "start_national_focus",
        params: [{"name": "focus", "type": "string"}],
    },
    {
        key: "complete_national_focus",
        params: [{"name": "focus", "type": "string"}],
    },
    {
        key: "unlock_national_focus",
        params: [{"name": "focus", "type": "string"}],
    },
    {
        key: "load_focus_tree",
        params: [{"name": "focus_tree", "type": "string"}],
    },
    {
        key: "add_tech_bonus",
        params: [{"name": "name", "type": "string"}, {"name": "bonus", "type": "float", "default": 1.0}, {"name": "uses", "type": "number", "default": 1}, {"name": "category", "type": "string"}],
    },
    {
        key: "set_technology",
        params: [{"name": "...", "type": "tech_tokens"}],
    },
    {
        key: "research_available_on_condition",
        params: [{"name": "...", "type": "scope_block"}],
    },
        {
        key: "declare_war_on",
        params: [{"name": "target", "type": "country_tag"}, {"name": "type", "type": "string"}],
    },
    {
        key: "white_peace",
        params: [{"name": "tag", "type": "country_tag"}],
    },
    {
        key: "add_to_faction",
        params: [{"name": "target", "type": "country_tag"}],
    },
    {
        key: "remove_from_faction",
        params: [{"name": "target", "type": "country_tag"}],
    },
    {
        key: "create_faction",
        params: [{"name": "name", "type": "localisation_key"}],
    },
    {
        key: "dismantle_faction",
    },
    {
        key: "puppet",
        params: [{"name": "target", "type": "country_tag"}],
    },
    {
        key: "set_capital",
        params: [{"name": "state", "type": "state_id"}],
    },
    {
        key: "transfer_state",
        params: [{"name": "state", "type": "state_id"}, {"name": "to", "type": "country_tag"}],
    },
    {
        key: "add_state_core",
        params: [{"name": "state", "type": "state_id"}],
    },
    {
        key: "remove_state_core",
        params: [{"name": "state", "type": "state_id"}],
    },
    {
        key: "set_state_owner",
        params: [{"name": "state", "type": "state_id"}],
    },
    {
        key: "add_claim_by",
        params: [{"name": "tag", "type": "country_tag"}],
    },
    {
        key: "add_core_of",
        params: [{"name": "tag", "type": "country_tag"}],
    },
        {
        key: "annex_country",
        params: [{"name": "target", "type": "country_tag"}, {"name": "transfer_troops", "type": "bool"}],
    },
        {
        key: "set_autonomy",
        params: [{"name": "target", "type": "country_tag"}, {"name": "autonomous_state", "type": "string"}, {"name": "freedom_level", "type": "float", "required": false}, {"name": "end_wars", "type": "bool"}, {"name": "end_civil_wars", "type": "bool"}],
    },
    {
        key: "diplomatic_relation",
        params: [{"name": "country", "type": "country_tag"}, {"name": "relation", "type": "string"}, {"name": "active", "type": "bool", "default": "yes"}],
    },
    {
        key: "give_guarantee",
        params: [{"name": "tag", "type": "country_tag"}],
    },
    {
        key: "give_military_access",
        params: [{"name": "tag", "type": "country_tag"}],
    },
    {
        key: "set_ruling_party",
        params: [{"name": "ideology", "type": "ideology"}],
    },
        {
        key: "add_popularity",
        params: [{"name": "ideology", "type": "ideology"}, {"name": "popularity", "type": "number"}],
    },
    {
        key: "set_politics",
        params: [{"name": "ruling_party", "type": "ideology"}, {"name": "elections_allowed", "type": "bool", "default": "no"}, {"name": "last_election", "type": "string"}],
    },
    {
        key: "add_opinion_modifier",
        params: [{"name": "target", "type": "country_tag"}, {"name": "modifier", "type": "string"}],
    },
    {
        key: "remove_opinion_modifier",
        params: [{"name": "target", "type": "country_tag"}, {"name": "modifier", "type": "string"}],
    },
    {
        key: "modify_country_flag",
        params: [{"name": "flag", "type": "string"}, {"name": "value", "type": "number", "default": 1}],
    },
    {
        key: "set_country_flag",
        params: [{"name": "value", "type": "string"}],
    },
    {
        key: "clr_country_flag",
        params: [{"name": "value", "type": "string"}],
    },
    {
        key: "set_global_flag",
        params: [{"name": "value", "type": "string"}],
    },
    {
        key: "clr_global_flag",
        params: [{"name": "value", "type": "string"}],
    },
    {
        key: "custom_effect_tooltip",
        params: [{"name": "key", "type": "localisation_key"}],
    },
    {
        key: "custom_trigger_tooltip",
        params: [{"name": "tooltip", "type": "localisation_key"}, {"name": "...", "type": "scope_block"}],
    },
    {
        key: "effect_tooltip",
        params: [{"name": "...", "type": "scope_block"}],
    },
    {
        key: "hidden_effect",
        params: [{"name": "...", "type": "scope_block"}],
    },
    {
        key: "random_list",
        params: [{"name": "...", "type": "scope_block"}],
    },
    {
        key: "activate_decision",
        params: [{"name": "decision", "type": "string"}],
    },
    {
        key: "add_days_remove",
        params: [{"name": "decision", "type": "string"}, {"name": "days", "type": "number", "default": 30}],
    },
    {
        key: "mark_focus_tree_layout_dirty",
    },
    {
        key: "add_resource",
        params: [{"name": "type", "type": "string"}, {"name": "amount", "type": "number", "default": 5}],
    },
    {
        key: "build_building",
        params: [{"name": "type", "type": "string"}, {"name": "level", "type": "number", "default": 1}, {"name": "instant_build", "type": "bool", "default": "yes"}],
    },
        {
        key: "add_dynamic_modifier",
        params: [{"name": "modifier", "type": "string", "required": false}],
    },
        {
        key: "remove_dynamic_modifier",
        params: [{"name": "modifier", "type": "string"}],
    },
        {
        key: "force_update_dynamic_modifier",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "add_state_resistance_compliance_modifier",
        params: [{"name": "modifier", "type": "string"}, {"name": "state", "type": "state_id"}],
    },
        {
        key: "remove_state_resistance_compliance_modifier",
        params: [{"name": "modifier", "type": "string"}, {"name": "state", "type": "state_id"}],
    },
        {
        key: "play_song",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "modify_global_flag",
        params: [{"name": "flag", "type": "string"}, {"name": "value", "type": "string"}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "save_event_target_as",
        params: [{"name": "value", "type": "string"}, {"name": "capital_scope", "type": "string"}],
    },
        {
        key: "save_global_event_target_as",
        params: [{"name": "value", "type": "string"}, {"name": "random_other_country", "type": "string"}],
    },
        {
        key: "clear_global_event_target",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "clear_global_event_targets",
    },
        {
        key: "sound_effect",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "randomize_weather",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "set_province_name",
        params: [{"name": "id", "type": "string"}, {"name": "name", "type": "string"}],
    },
        {
        key: "reset_province_name",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "damage_units",
        params: [{"name": "province", "type": "string"}, {"name": "state", "type": "string"}, {"name": "region", "type": "string"}, {"name": "limit", "type": "string"}, {"name": "damage", "type": "string"}, {"name": "org_damage", "type": "string"}, {"name": "str_damage", "type": "string"}, {"name": "ratio", "type": "bool"}, {"name": "template", "type": "string"}, {"name": "army", "type": "bool"}, {"name": "navy", "type": "bool"}],
    },
        {
        key: "create_entity",
        params: [{"name": "entity", "type": "string"}, {"name": "id", "type": "string", "required": false}, {"name": "var", "type": "string", "required": false}, {"name": "x", "type": "number"}, {"name": "y", "type": "number"}, {"name": "z", "type": "number"}, {"name": "province", "type": "number"}, {"name": "state", "type": "number"}, {"name": "rotation", "type": "float"}, {"name": "scale", "type": "float"}, {"name": "min_zoom", "type": "float"}, {"name": "visible", "type": "string"}],
    },
        {
        key: "destroy_entity",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "set_entity_movement",
        params: [{"name": "id", "type": "string"}, {"name": "ratio", "type": "number"}, {"name": "rotation", "type": "number"}, {"name": "x", "type": "number"}, {"name": "y", "type": "number"}, {"name": "z", "type": "number"}, {"name": "province", "type": "number"}, {"name": "state", "type": "number"}],
    },
        {
        key: "set_entity_position",
        params: [{"name": "id", "type": "string"}],
    },
        {
        key: "set_entity_rotation",
        params: [{"name": "id", "type": "string"}, {"name": "rotation", "type": "float"}],
    },
        {
        key: "set_entity_scale",
        params: [{"name": "id", "type": "string"}, {"name": "scale", "type": "float"}],
    },
        {
        key: "set_entity_animation",
        params: [{"name": "id", "type": "number"}, {"name": "animation", "type": "string"}],
    },
        {
        key: "build_railway",
        params: [{"name": "level", "type": "number"}, {"name": "build_only_on_allied", "type": "bool"}, {"name": "fallback", "type": "bool"}, {"name": "path", "type": "string"}, {"name": "start_province", "type": "number"}, {"name": "target_province", "type": "number"}, {"name": "start_state", "type": "number"}, {"name": "target_state", "type": "number"}],
    },
        {
        key: "event_option_tooltip",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "create_purchase_contract",
        params: [{"name": "seller", "type": "country_tag"}, {"name": "buyer", "type": "country_tag"}, {"name": "civilian_factories", "type": "number"}, {"name": "equipment", "type": "string"}, {"name": "type", "type": "string"}, {"name": "amount", "type": "number"}],
    },
        {
        key: "start_border_war",
        params: [{"name": "change_state_after_war", "type": "bool"}, {"name": "state", "type": "string"}, {"name": "num_provinces", "type": "string"}, {"name": "on_win", "type": "string"}, {"name": "on_lose", "type": "string"}, {"name": "on_cancel", "type": "string"}, {"name": "modifier", "type": "float"}, {"name": "dig_in_factor", "type": "float"}, {"name": "terrain_factor", "type": "float"}],
    },
        {
        key: "set_border_war_data",
        params: [{"name": "attacker", "type": "string"}, {"name": "defender", "type": "string"}],
    },
        {
        key: "cancel_border_war",
        params: [{"name": "attacker", "type": "string"}, {"name": "defender", "type": "string"}],
    },
        {
        key: "finalize_border_war",
        params: [{"name": "attacker", "type": "string"}, {"name": "defender", "type": "string"}],
    },
        {
        key: "set_variable",
        params: [{"name": "var", "type": "string"}, {"name": "value", "type": "float"}, {"name": "tooltip", "type": "string", "required": false}],
    },
        {
        key: "set_variable_to_random",
        params: [{"name": "var", "type": "string"}, {"name": "min", "type": "float"}, {"name": "max", "type": "float"}, {"name": "integer", "type": "bool"}],
    },
        {
        key: "clear_variable",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_to_variable",
        params: [{"name": "var", "type": "string"}, {"name": "value", "type": "float"}, {"name": "tooltip", "type": "string", "required": false}],
    },
        {
        key: "subtract_from_variable",
        params: [{"name": "var", "type": "string"}, {"name": "value", "type": "float"}, {"name": "tooltip", "type": "string", "required": false}],
    },
        {
        key: "multiply_variable",
        params: [{"name": "var", "type": "string"}, {"name": "value", "type": "float"}, {"name": "tooltip", "type": "string", "required": false}],
    },
        {
        key: "divide_variable",
        params: [{"name": "var", "type": "string"}, {"name": "value", "type": "float"}, {"name": "tooltip", "type": "string", "required": false}],
    },
        {
        key: "modulo_variable",
        params: [{"name": "var", "type": "string"}, {"name": "value", "type": "float"}, {"name": "tooltip", "type": "string", "required": false}],
    },
        {
        key: "round_variable",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "clamp_variable",
        params: [{"name": "var", "type": "string"}, {"name": "min", "type": "float"}, {"name": "max", "type": "float"}],
    },
        {
        key: "career_profile_set_temp_playthrough_variable",
        params: [{"name": "var", "type": "string"}, {"name": "value", "type": "float"}],
    },
        {
        key: "career_profile_set_temp_variable",
        params: [{"name": "var", "type": "string"}, {"name": "value", "type": "float"}],
    },
        {
        key: "add_to_array",
        params: [{"name": "array", "type": "string"}, {"name": "value", "type": "float"}, {"name": "index", "type": "number", "required": false}],
    },
        {
        key: "remove_from_array",
        params: [{"name": "array", "type": "string"}, {"name": "value", "type": "float", "required": false}, {"name": "index", "type": "number", "required": false}],
    },
        {
        key: "clear_array",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "resize_array",
        params: [{"name": "array", "type": "string"}, {"name": "value", "type": "float", "required": false}, {"name": "size", "type": "number"}],
    },
        {
        key: "find_highest_in_array",
        params: [{"name": "array", "type": "string"}, {"name": "value", "type": "string"}, {"name": "index", "type": "string"}],
    },
        {
        key: "find_lowest_in_array",
        params: [{"name": "array", "type": "string"}, {"name": "value", "type": "string"}, {"name": "index", "type": "string"}],
    },
        {
        key: "set_cosmetic_tag",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "drop_cosmetic_tag",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "set_rule",
        params: [{"name": "value", "type": "string"}, {"name": "desc", "type": "localisation_key"}],
    },
        {
        key: "can_access_market",
    },
        {
        key: "can_be_spymaster",
    },
        {
        key: "can_boost_other_ideologies",
    },
        {
        key: "can_boost_own_ideology",
    },
        {
        key: "can_create_collaboration_government",
    },
        {
        key: "can_create_factions",
    },
        {
        key: "can_declare_war_on_same_ideology",
    },
        {
        key: "can_declare_war_without_wargoal_when_in_war",
    },
        {
        key: "can_decline_call_to_war",
    },
        {
        key: "can_force_government",
    },
        {
        key: "can_generate_female_aces",
    },
        {
        key: "can_generate_female_country_leaders",
    },
        {
        key: "can_generate_female_unit_leaders",
    },
        {
        key: "can_guarantee_other_ideologies",
    },
        {
        key: "can_join_factions",
    },
        {
        key: "can_join_factions_not_allowed_diplomacy",
    },
        {
        key: "can_join_opposite_factions",
    },
        {
        key: "can_lower_tension",
    },
        {
        key: "can_not_build_buildings",
    },
        {
        key: "can_not_declare_war",
    },
        {
        key: "can_occupy_non_war",
    },
        {
        key: "can_only_justify_war_on_threat_country",
    },
        {
        key: "can_puppet",
    },
        {
        key: "can_send_volunteers",
    },
        {
        key: "can_use_kamikaze_pilots",
    },
        {
        key: "contributes_operatives",
    },
        {
        key: "units_deployed_to_overlord",
    },
        {
        key: "set_party_rule",
        params: [{"name": "ideology", "type": "ideology"}, {"name": "desc", "type": "localisation_key", "required": false}, {"name": "value", "type": "string"}],
    },
        {
        key: "add_relation_rule_override",
        params: [{"name": "target", "type": "country_tag"}, {"name": "usage_desc", "type": "localisation_key", "required": false}, {"name": "trigger", "type": "string", "required": false}, {"name": "value", "type": "string"}],
    },
        {
        key: "remove_relation_rule_override",
        params: [{"name": "target", "type": "country_tag"}, {"name": "usage_desc", "type": "localisation_key", "required": false}, {"name": "trigger", "type": "string"}, {"name": "value", "type": "string"}],
    },
        {
        key: "scoped_sound_effect",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "scoped_play_song",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "goto_province",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "goto_state",
        params: [{"name": "value", "type": "state_id"}],
    },
        {
        key: "change_tag_from",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "reserve_dynamic_country",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "force_update_map_mode",
        params: [{"name": "limit", "type": "string", "required": false}, {"name": "mapmode", "type": "string"}],
    },
        {
        key: "add_ai_strategy",
        params: [{"name": "type", "type": "string"}, {"name": "id", "type": "country_tag"}, {"name": "value", "type": "number"}],
    },
        {
        key: "add_state_claim",
        params: [{"name": "value", "type": "state_id"}],
    },
        {
        key: "remove_state_claim",
        params: [{"name": "value", "type": "state_id"}],
    },
        {
        key: "set_state_controller",
        params: [{"name": "value", "type": "state_id"}],
    },
        {
        key: "add_contested_owner",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "remove_contested_owner",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "set_province_controller",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "set_political_power",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_command_power",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "army_experience",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "navy_experience",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "air_experience",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "set_popularities",
        params: [{"name": "value", "type": "ideology"}],
    },
        {
        key: "set_political_party",
        params: [{"name": "ideology", "type": "ideology"}, {"name": "popularity", "type": "number"}],
    },
        {
        key: "set_party_name",
        params: [{"name": "ideology", "type": "ideology"}, {"name": "long_name", "type": "string"}],
    },
        {
        key: "hold_election",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "set_power_balance",
        params: [{"name": "id", "type": "string"}, {"name": "left_side", "type": "string"}, {"name": "right_side", "type": "string"}, {"name": "set_default", "type": "bool", "required": false}, {"name": "set_value", "type": "float", "required": false}],
    },
        {
        key: "remove_power_balance",
        params: [{"name": "id", "type": "string"}],
    },
        {
        key: "add_power_balance_value",
        params: [{"name": "id", "type": "string"}, {"name": "value", "type": "float"}, {"name": "tooltip_side", "type": "string", "required": false}],
    },
        {
        key: "add_power_balance_modifier",
        params: [{"name": "id", "type": "string"}, {"name": "modifier", "type": "string"}],
    },
        {
        key: "remove_power_balance_modifier",
        params: [{"name": "id", "type": "string"}, {"name": "modifier", "type": "string"}],
    },
        {
        key: "remove_all_power_balance_modifiers",
        params: [{"name": "id", "type": "string"}],
    },
        {
        key: "set_power_balance_gfx",
        params: [{"name": "id", "type": "string"}, {"name": "side", "type": "string"}, {"name": "gfx", "type": "string"}],
    },
        {
        key: "set_major",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "release",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "release_on_controlled",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "release_puppet",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "release_puppet_on_controlled",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "release_autonomy",
        params: [{"name": "target", "type": "country_tag"}, {"name": "autonomy_state", "type": "string"}, {"name": "freedom_level", "type": "float", "required": false}],
    },
        {
        key: "recall_attache",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "reverse_add_opinion_modifier",
        params: [{"name": "target", "type": "country_tag"}, {"name": "modifier", "type": "string"}],
    },
        {
        key: "add_relation_modifier",
        params: [{"name": "target", "type": "country_tag"}, {"name": "modifier", "type": "string"}],
    },
        {
        key: "remove_relation_modifier",
        params: [{"name": "target", "type": "country_tag"}, {"name": "modifier", "type": "string"}],
    },
        {
        key: "add_collaboration",
        params: [{"name": "target", "type": "country_tag"}, {"name": "value", "type": "string"}],
    },
        {
        key: "set_collaboration",
        params: [{"name": "target", "type": "country_tag"}, {"name": "value", "type": "string"}],
    },
        {
        key: "recall_volunteers_from",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "set_occupation_law",
        params: [{"name": "value", "type": "string"}, {"name": "GER", "type": "string"}, {"name": "every_controlled_state", "type": "string"}],
    },
        {
        key: "set_occupation_law_where_available",
        params: [{"name": "value", "type": "string"}, {"name": "USA", "type": "string"}, {"name": "GER", "type": "string"}],
    },
        {
        key: "send_embargo",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "break_embargo",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "give_market_access",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "create_faction_from_template",
        params: [{"name": "value", "type": "string"}, {"name": "template", "type": "string"}, {"name": "name", "type": "localisation_key"}, {"name": "icon", "type": "string"}, {"name": "color", "type": "number"}],
    },
        {
        key: "leave_faction",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "set_faction_name",
    },
        {
        key: "set_faction_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "set_faction_spymaster",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "set_faction_rule",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "set_faction_manifest",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_faction_goal",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "remove_faction_goal",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_faction_goal_slot",
        params: [{"name": "category", "type": "string"}, {"name": "value", "type": "number"}],
    },
        {
        key: "add_faction_influence_ratio",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "add_faction_influence_score",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_faction_initiative",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_faction_power_projection",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "set_faction_upgrade",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "set_faction_member_upgrade_min",
        params: [{"name": "upgrade", "type": "string"}],
    },
        {
        key: "set_faction_military_unlocked",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "set_faction_research_unlocked",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "end_puppet",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "add_autonomy_ratio",
        params: [{"name": "value", "type": "float"}, {"name": "localization", "type": "string"}],
    },
        {
        key: "add_autonomy_score",
        params: [{"name": "value", "type": "float"}, {"name": "localization", "type": "string"}],
    },
        {
        key: "add_legitimacy",
    },
        {
        key: "set_legitimacy",
    },
        {
        key: "become_exiled_in",
    },
        {
        key: "end_exile",
    },
        {
        key: "add_threat",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_named_threat",
        params: [{"name": "threat", "type": "number"}, {"name": "name", "type": "string"}],
    },
        {
        key: "add_to_war",
        params: [{"name": "targeted_alliance", "type": "country_tag"}, {"name": "enemy", "type": "country_tag", "required": false}],
    },
        {
        key: "start_peace_conference",
        params: [{"name": "tag", "type": "country_tag"}, {"name": "score_factor", "type": "float"}, {"name": "message", "type": "localisation_key", "required": false}, {"name": "winner_scope", "type": "scope_block", "required": false}, {"name": "loser_scope", "type": "scope_block", "required": false}],
    },
        {
        key: "set_truce",
        params: [{"name": "target", "type": "country_tag"}, {"name": "days", "type": "number"}],
    },
        {
        key: "create_wargoal",
        params: [{"name": "target", "type": "country_tag"}, {"name": "type", "type": "string"}, {"name": "generator", "type": "string"}, {"name": "expire", "type": "string"}],
    },
        {
        key: "remove_wargoal",
        params: [{"name": "target", "type": "country_tag"}, {"name": "type", "type": "string"}],
    },
        {
        key: "add_civil_war_target",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "remove_civil_war_target",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "transfer_units_fraction",
        params: [{"name": "target", "type": "country_tag"}, {"name": "size", "type": "float", "required": false}, {"name": "army_ratio", "type": "float", "required": false}, {"name": "navy_ratio", "type": "float", "required": false}, {"name": "air_ratio", "type": "float", "required": false}, {"name": "keep_unit_leaders", "type": "string", "required": false}, {"name": "keep_unit_leaders_trigger", "type": "string", "required": false}],
    },
        {
        key: "add_nuclear_bombs",
    },
        {
        key: "launch_nuke",
        params: [{"name": "province", "type": "string"}, {"name": "state", "type": "string"}, {"name": "controller", "type": "country_tag"}, {"name": "use_nuke", "type": "string"}, {"name": "nuke_type", "type": "string"}],
    },
        {
        key: "create_import",
        params: [{"name": "resource", "type": "string"}, {"name": "amount", "type": "number"}],
    },
        {
        key: "give_resource_rights",
        params: [{"name": "receiver", "type": "country_tag"}, {"name": "state", "type": "state_id"}, {"name": "resources", "type": "string", "required": false}],
    },
        {
        key: "remove_resource_rights",
        params: [{"name": "value", "type": "state_id"}, {"name": "ENG", "type": "string"}],
    },
        {
        key: "set_fuel",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "set_fuel_ratio",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "add_offsite_building",
        params: [{"name": "type", "type": "string"}, {"name": "level", "type": "string"}],
    },
        {
        key: "modify_building_resources",
        params: [{"name": "building", "type": "string"}, {"name": "resource", "type": "string"}],
    },
        {
        key: "damage_building",
        params: [{"name": "type", "type": "string"}, {"name": "tags", "type": "country_tag"}, {"name": "tags", "type": "string"}, {"name": "repair_speed_modifier", "type": "float"}, {"name": "damage", "type": "float"}, {"name": "province", "type": "string"}],
    },
        {
        key: "uncomplete_national_focus",
        params: [{"name": "focus", "type": "string", "required": false}],
    },
        {
        key: "activate_shine_on_focus",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "deactivate_shine_on_focus",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "reduce_focus_completion_cost",
        params: [{"name": "focus", "type": "string"}, {"name": "cost", "type": "number"}],
    },
        {
        key: "activate_targeted_decision",
        params: [{"name": "target", "type": "country_tag"}, {"name": "decision", "type": "string"}],
    },
        {
        key: "remove_targeted_decision",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "unlock_decision_tooltip",
        params: [{"name": "value", "type": "string"}, {"name": "value", "type": "string"}, {"name": "value", "type": "string"}],
    },
        {
        key: "unlock_decision_category_tooltip",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "remove_decision",
    },
        {
        key: "remove_decision_on_cooldown",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "activate_mission",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "activate_mission_tooltip",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "remove_mission",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_days_mission_timeout",
        params: [{"name": "mission", "type": "string"}, {"name": "days", "type": "number"}],
    },
        {
        key: "add_research_slot",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "set_research_slots",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_to_tech_sharing_group",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "remove_from_tech_sharing_group",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "modify_tech_sharing_bonus",
        params: [{"name": "id", "type": "string"}, {"name": "bonus", "type": "float"}],
    },
        {
        key: "inherit_technology",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "mark_technology_tree_layout_dirty",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "modify_timed_idea",
        params: [{"name": "idea", "type": "idea_token"}, {"name": "days", "type": "number"}, {"name": "months", "type": "number"}, {"name": "years", "type": "number"}],
    },
        {
        key: "remove_ideas_with_trait",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "show_ideas_tooltip",
        params: [{"name": "value", "type": "idea_token"}],
    },
        {
        key: "load_oob",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "division_template",
        params: [{"name": "regiments", "type": "string"}, {"name": "value", "type": "string"}, {"name": "support", "type": "string"}, {"name": "value", "type": "string"}, {"name": "division_names_group", "type": "string"}, {"name": "is_locked", "type": "bool", "required": false}, {"name": "force_allow_recruiting", "type": "bool", "required": false}, {"name": "division_cap", "type": "number", "required": false}, {"name": "priority", "type": "number", "required": false}, {"name": "template_counter", "type": "number", "required": false}, {"name": "override_model", "type": "string", "required": false}],
    },
        {
        key: "create_colonial_division_template",
        params: [{"name": "subject", "type": "country_tag"}, {"name": "division_template", "type": "string"}],
    },
        {
        key: "add_units_to_division_template",
        params: [{"name": "template_name", "type": "string", "required": false}, {"name": "regiments", "type": "string"}, {"name": "value", "type": "string"}, {"name": "support", "type": "string"}, {"name": "value", "type": "string"}],
    },
        {
        key: "set_division_template_lock",
        params: [{"name": "division_template", "type": "string"}, {"name": "is_locked", "type": "bool"}],
    },
        {
        key: "country_lock_all_division_template",
        params: [{"name": "value", "type": "bool"}, {"name": "is_locked", "type": "bool"}, {"name": "desc", "type": "localisation_key"}],
    },
        {
        key: "set_division_force_allow_recruiting",
        params: [{"name": "division_template", "type": "string"}, {"name": "force_allow_recruiting", "type": "bool"}],
    },
        {
        key: "set_division_template_cap",
        params: [{"name": "division_template", "type": "string"}, {"name": "division_cap", "type": "number"}],
    },
        {
        key: "clear_division_template_cap",
        params: [{"name": "division_template", "type": "string"}],
    },
        {
        key: "delete_unit_template_and_units",
        params: [{"name": "division_template", "type": "string"}],
    },
        {
        key: "delete_unit",
        params: [{"name": "state", "type": "string"}, {"name": "division_template", "type": "string"}, {"name": "id", "type": "number"}, {"name": "disband", "type": "bool"}],
    },
        {
        key: "delete_units",
        params: [{"name": "division_template", "type": "string"}, {"name": "disband", "type": "bool"}],
    },
        {
        key: "create_railway_gun",
        params: [{"name": "equipment", "type": "string"}, {"name": "name", "type": "string", "required": false}, {"name": "location", "type": "string"}],
    },
        {
        key: "teleport_railway_guns_to_deploy_province",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "add_unit_bonus",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "set_equipment_fraction",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "send_equipment",
        params: [{"name": "type", "type": "string"}, {"name": "amount", "type": "number"}],
    },
        {
        key: "send_equipment_fraction",
        params: [{"name": "value", "type": "string"}, {"name": "target", "type": "country_tag"}],
    },
        {
        key: "create_production_license",
        params: [{"name": "target", "type": "country_tag"}, {"name": "new_prioritised", "type": "string"}, {"name": "cost_factor", "type": "float"}, {"name": "version", "type": "number"}],
    },
        {
        key: "add_equipment_subsidy",
        params: [{"name": "cic", "type": "number"}, {"name": "equipment_type", "type": "string"}, {"name": "seller_tags", "type": "string"}, {"name": "seller_trigger", "type": "string"}],
    },
        {
        key: "add_cic",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "create_equipment_variant",
        params: [{"name": "name", "type": "string"}, {"name": "type", "type": "string"}, {"name": "parent_version", "type": "number", "required": false}, {"name": "show_position", "type": "bool", "required": false}, {"name": "obsolete", "type": "bool", "required": false}, {"name": "mark_older_equipment_obsolete", "type": "bool", "required": false}, {"name": "name_group", "type": "string", "required": false}, {"name": "role_icon_index", "type": "number", "required": false}, {"name": "model", "type": "string", "required": false}, {"name": "icon", "type": "string", "required": false}, {"name": "design_team", "type": "string", "required": false}, {"name": "allow_without_tech", "type": "bool", "required": false}],
    },
        {
        key: "add_equipment_production",
        params: [{"name": "amount", "type": "number", "required": false}, {"name": "requested_factories", "type": "number", "required": false}, {"name": "progress", "type": "float", "required": false}, {"name": "efficiency", "type": "float", "required": false}, {"name": "name", "type": "string", "required": false}, {"name": "industrial_manufacturer", "type": "string"}, {"name": "type", "type": "string"}, {"name": "creator", "type": "country_tag", "required": false}, {"name": "version_name", "type": "string", "required": false}],
    },
        {
        key: "add_design_template_bonus",
        params: [{"name": "name", "type": "localisation_key"}, {"name": "uses", "type": "number"}, {"name": "cost_factor", "type": "float"}, {"name": "equipment", "type": "string"}],
    },
        {
        key: "add_equipment_bonus",
        params: [{"name": "project", "type": "string", "required": false}, {"name": "name", "type": "localisation_key"}, {"name": "bonus", "type": "string"}],
    },
        {
        key: "set_equipment_version_number",
        params: [{"name": "type", "type": "string"}, {"name": "version", "type": "number"}],
    },
        {
        key: "destroy_ships",
        params: [{"name": "type", "type": "string"}, {"name": "count", "type": "number"}],
    },
        {
        key: "transfer_navy",
        params: [{"name": "target", "type": "country_tag"}],
    },
        {
        key: "transfer_ship",
        params: [{"name": "type", "type": "string"}, {"name": "target", "type": "country_tag"}, {"name": "prefer_name", "type": "string", "required": false}, {"name": "exclude_refitting", "type": "bool", "required": false}],
    },
        {
        key: "create_ship",
        params: [{"name": "type", "type": "string"}, {"name": "equipment_variant", "type": "string"}, {"name": "creator", "type": "country_tag", "required": false}, {"name": "name", "type": "string", "required": false}, {"name": "amount", "type": "number", "required": false}, {"name": "FRA", "type": "string"}],
    },
        {
        key: "add_mines",
    },
        {
        key: "add_ace",
        params: [{"name": "name", "type": "string"}, {"name": "surname", "type": "string"}, {"name": "callsign", "type": "string"}, {"name": "type", "type": "string"}, {"name": "is_female", "type": "bool"}],
    },
        {
        key: "unlock_tactic",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_doctrine_cost_reduction",
        params: [{"name": "name", "type": "localisation_key", "required": false}, {"name": "cost_reduction", "type": "float"}, {"name": "uses", "type": "number"}, {"name": "category", "type": "string"}],
    },
        {
        key: "add_mastery",
        params: [{"name": "amount", "type": "number"}, {"name": "folder", "type": "string", "required": false}, {"name": "grand_doctrine", "type": "string", "required": false}, {"name": "sub_doctrine", "type": "string", "required": false}, {"name": "track", "type": "string", "required": false}, {"name": "index", "type": "number", "required": false}],
    },
        {
        key: "add_daily_mastery",
        params: [{"name": "amount", "type": "float"}, {"name": "days", "type": "number"}, {"name": "name", "type": "localisation_key"}, {"name": "folder", "type": "string", "required": false}, {"name": "grand_doctrine", "type": "string", "required": false}, {"name": "sub_doctrine", "type": "string", "required": false}, {"name": "track", "type": "string", "required": false}, {"name": "index", "type": "number", "required": false}],
    },
        {
        key: "add_mastery_bonus",
        params: [{"name": "bonus", "type": "float"}, {"name": "days", "type": "number"}, {"name": "name", "type": "localisation_key"}, {"name": "folder", "type": "string", "required": false}, {"name": "grand_doctrine", "type": "string", "required": false}, {"name": "sub_doctrine", "type": "string", "required": false}, {"name": "track", "type": "string", "required": false}, {"name": "index", "type": "number", "required": false}],
    },
        {
        key: "set_grand_doctrine",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "set_sub_doctrine",
        params: [{"name": "value", "type": "string"}, {"name": "sub_doctrine", "type": "string"}, {"name": "folder", "type": "string", "required": false}, {"name": "track", "type": "number", "required": false}],
    },
        {
        key: "create_intelligence_agency",
        params: [{"name": "name", "type": "string", "required": false}, {"name": "icon", "type": "string", "required": false}],
    },
        {
        key: "upgrade_intelligence_agency",
    },
        {
        key: "add_decryption",
        params: [{"name": "target", "type": "country_tag"}, {"name": "amount", "type": "number"}, {"name": "ratio", "type": "string"}],
    },
        {
        key: "add_intel",
        params: [{"name": "target", "type": "country_tag"}, {"name": "civilian_intel", "type": "number"}, {"name": "army_intel", "type": "number"}, {"name": "navy_intel", "type": "number"}, {"name": "airforce_intel", "type": "number"}],
    },
        {
        key: "add_operation_token",
        params: [{"name": "tag", "type": "country_tag"}, {"name": "token", "type": "string"}],
    },
        {
        key: "remove_operation_token",
        params: [{"name": "tag", "type": "country_tag"}, {"name": "token", "type": "string"}],
    },
        {
        key: "capture_operative",
        params: [{"name": "captured_by", "type": "country_tag"}, {"name": "ignore_death_chance", "type": "bool"}],
    },
        {
        key: "create_operative_leader",
        params: [{"name": "bypass_recruitment", "type": "bool"}, {"name": "available_to_spy_master", "type": "bool"}, {"name": "portrait_tag_override", "type": "bool"}, {"name": "name", "type": "string"}, {"name": "GFX", "type": "string"}, {"name": "nationalities", "type": "string"}, {"name": "traits", "type": "string"}, {"name": "gender", "type": "string"}],
    },
        {
        key: "free_operative",
        params: [{"name": "captured_by", "type": "country_tag"}],
    },
        {
        key: "free_random_operative",
        params: [{"name": "captured_by", "type": "country_tag"}, {"name": "all", "type": "bool"}],
    },
        {
        key: "kill_operative",
        params: [{"name": "killed_by", "type": "country_tag"}],
    },
        {
        key: "turn_operative",
        params: [{"name": "turned_by", "type": "country_tag"}],
    },
        {
        key: "steal_random_tech_bonus",
        params: [{"name": "category", "type": "string"}, {"name": "folder", "type": "string"}, {"name": "ahead_reduction", "type": "float"}, {"name": "bonus", "type": "float"}, {"name": "base_bonus", "type": "float"}, {"name": "instant", "type": "bool"}, {"name": "dynamic", "type": "bool"}, {"name": "name", "type": "localisation_key"}, {"name": "target", "type": "country_tag"}, {"name": "uses", "type": "number"}],
    },
        {
        key: "set_nationality",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "retire_character",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "set_character_name",
        params: [{"name": "value", "type": "localisation_key"}],
    },
        {
        key: "character_list_tooltip",
        params: [{"name": "limit", "type": "string"}, {"name": "random_select_amount", "type": "number"}],
    },
        {
        key: "add_trait",
        params: [{"name": "slot", "type": "string"}, {"name": "ideology", "type": "ideology"}, {"name": "trait", "type": "string"}],
    },
        {
        key: "remove_trait",
        params: [{"name": "slot", "type": "string"}, {"name": "ideology", "type": "ideology"}, {"name": "trait", "type": "string"}],
    },
        {
        key: "create_corps_commander",
        params: [{"name": "name", "type": "string"}, {"name": "picture", "type": "string"}, {"name": "portrait_path", "type": "string"}, {"name": "gfx", "type": "string"}, {"name": "skill", "type": "number"}, {"name": "attack_skill", "type": "number"}, {"name": "defense_skill", "type": "number"}, {"name": "planning_skill", "type": "number"}, {"name": "logistics_skill", "type": "number"}, {"name": "traits", "type": "string"}, {"name": "female", "type": "bool"}, {"name": "legacy_id", "type": "number", "required": false}],
    },
        {
        key: "create_field_marshal",
        params: [{"name": "name", "type": "string"}, {"name": "picture", "type": "string"}, {"name": "portrait_path", "type": "string"}, {"name": "gfx", "type": "string"}, {"name": "skill", "type": "number"}, {"name": "attack_skill", "type": "number"}, {"name": "defense_skill", "type": "number"}, {"name": "planning_skill", "type": "number"}, {"name": "logistics_skill", "type": "number"}, {"name": "traits", "type": "string"}, {"name": "female", "type": "bool"}, {"name": "legacy_id", "type": "number", "required": false}],
    },
        {
        key: "create_navy_leader",
        params: [{"name": "name", "type": "string"}, {"name": "picture", "type": "string"}, {"name": "portrait_path", "type": "string"}, {"name": "gfx", "type": "string"}, {"name": "skill", "type": "number"}, {"name": "attack_skill", "type": "number"}, {"name": "defense_skill", "type": "number"}, {"name": "maneuvering_skill", "type": "number"}, {"name": "coordination_skill", "type": "number"}, {"name": "traits", "type": "string"}, {"name": "female", "type": "bool"}, {"name": "legacy_id", "type": "number", "required": false}],
    },
        {
        key: "remove_unit_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "add_corps_commander_role",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_field_marshal_role",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_naval_commander_role",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "show_unit_leaders_tooltip",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "create_country_leader",
        params: [{"name": "name", "type": "string"}, {"name": "desc", "type": "string"}, {"name": "female", "type": "bool"}],
    },
        {
        key: "add_country_leader_role",
        params: [{"name": "character", "type": "string"}, {"name": "country_leader", "type": "string"}, {"name": "promote_leader", "type": "bool", "required": false}],
    },
        {
        key: "promote_character",
        params: [{"name": "value", "type": "bool"}, {"name": "value", "type": "ideology"}],
    },
        {
        key: "remove_country_leader_role",
        params: [{"name": "ideology", "type": "string"}],
    },
        {
        key: "kill_ideology_leader",
        params: [{"name": "value", "type": "ideology"}],
    },
        {
        key: "retire_ideology_leader",
        params: [{"name": "value", "type": "ideology"}],
    },
        {
        key: "kill_country_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "retire_country_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "set_country_leader_ideology",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "set_country_leader_description",
        params: [{"name": "ideology", "type": "ideology", "required": false}, {"name": "desc", "type": "localisation_key"}],
    },
        {
        key: "set_country_leader_name",
        params: [{"name": "ideology", "type": "ideology", "required": false}, {"name": "name", "type": "localisation_key"}],
    },
        {
        key: "set_country_leader_portrait",
        params: [{"name": "ideology", "type": "ideology", "required": false}, {"name": "portrait", "type": "string"}],
    },
        {
        key: "add_country_leader_trait",
        params: [{"name": "value", "type": "string"}, {"name": "ideology", "type": "ideology"}, {"name": "trait", "type": "string"}],
    },
        {
        key: "remove_country_leader_trait",
        params: [{"name": "value", "type": "string"}, {"name": "ideology", "type": "ideology"}, {"name": "trait", "type": "string"}],
    },
        {
        key: "swap_ruler_traits",
    },
        {
        key: "activate_advisor",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "deactivate_advisor",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_advisor_role",
        params: [{"name": "advisor", "type": "string"}, {"name": "activate", "type": "bool", "required": false}],
    },
        {
        key: "remove_advisor_role",
        params: [{"name": "slot", "type": "number"}],
    },
        {
        key: "set_can_be_fired_in_advisor_role",
        params: [{"name": "slot", "type": "string"}, {"name": "value", "type": "bool"}],
    },
        {
        key: "add_scientist_role",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "remove_scientist_role",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "generate_scientist_character",
        params: [{"name": "portrait", "type": "string", "required": false}, {"name": "portrait_tag_override", "type": "country_tag", "required": false}, {"name": "gender", "type": "string", "required": false}, {"name": "skills", "type": "string", "required": false}, {"name": "traits", "type": "string", "required": false}],
    },
        {
        key: "show_mio_tooltip",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "unlock_military_industrial_organization_tooltip",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "unlock_mio_policy_tooltip",
        params: [{"name": "value", "type": "string"}, {"name": "policy", "type": "string"}, {"name": "show_modifiers", "type": "bool"}],
    },
        {
        key: "add_mio_policy_cost",
        params: [{"name": "policy", "type": "string"}, {"name": "value", "type": "number"}],
    },
        {
        key: "set_mio_policy_cost",
        params: [{"name": "policy", "type": "string"}, {"name": "value", "type": "number"}],
    },
        {
        key: "add_mio_policy_cooldown",
        params: [{"name": "policy", "type": "string"}, {"name": "value", "type": "number"}],
    },
        {
        key: "set_mio_policy_cooldown",
        params: [{"name": "policy", "type": "string"}, {"name": "value", "type": "number"}, {"name": "set_mio_policy_cooldown", "type": "string"}, {"name": "policy", "type": "string"}, {"name": "value", "type": "string"}],
    },
        {
        key: "complete_special_project",
        params: [{"name": "project", "type": "string"}, {"name": "scientist", "type": "string", "required": false}, {"name": "state", "type": "string", "required": false}, {"name": "iteration_output", "type": "string", "required": false}, {"name": "show_modifiers", "type": "bool", "required": false}],
    },
        {
        key: "add_breakthrough_points",
        params: [{"name": "specialization", "type": "string"}, {"name": "value", "type": "number"}],
    },
        {
        key: "add_breakthrough_progress",
        params: [{"name": "specialization", "type": "string"}, {"name": "value", "type": "number"}],
    },
        {
        key: "career_profile_step_missiolini",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "recruit_character",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "generate_character",
        params: [{"name": "token_base", "type": "string"}, {"name": "name", "type": "localisation_key"}],
    },
        {
        key: "set_oob",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "set_naval_oob",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "set_air_oob",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "set_keyed_oob",
        params: [{"name": "key", "type": "string"}, {"name": "name", "type": "string"}],
    },
        {
        key: "get_highest_scored_country_temp",
        params: [{"name": "scorer", "type": "string"}],
    },
        {
        key: "get_sorted_scored_countries_temp",
        params: [{"name": "scorer", "type": "string"}, {"name": "array", "type": "string"}, {"name": "scores", "type": "string"}],
    },
        {
        key: "get_supply_vehicles",
        params: [{"name": "var", "type": "string"}, {"name": "type", "type": "string"}, {"name": "need", "type": "bool"}],
    },
        {
        key: "get_supply_vehicles_temp",
        params: [{"name": "var", "type": "string"}, {"name": "type", "type": "string"}, {"name": "need", "type": "bool"}],
    },
        {
        key: "state_event",
        params: [{"name": "id", "type": "event_id"}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "set_state_flag",
        params: [{"name": "value", "type": "string"}, {"name": "flag", "type": "string"}, {"name": "days", "type": "number", "required": false}, {"name": "value", "type": "number"}],
    },
        {
        key: "clr_state_flag",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "modify_state_flag",
        params: [{"name": "flag", "type": "string"}, {"name": "value", "type": "string"}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "set_state_name",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "reset_state_name",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "remove_claim_by",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "remove_core_of",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "set_demilitarized_zone",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "set_state_category",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_state_modifier",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "set_border_war",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "create_unit",
        params: [{"name": "division", "type": "string"}, {"name": "owner", "type": "country_tag"}, {"name": "prioritize_location", "type": "string", "required": false}, {"name": "allow_spawning_on_enemy_provs", "type": "bool"}, {"name": "count", "type": "number"}, {"name": "id", "type": "number"}, {"name": "country_score", "type": "string"}, {"name": "divisional_commander_xp", "type": "number"}, {"name": "name", "type": "string"}, {"name": "division_template", "type": "string"}, {"name": "start_experience_factor", "type": "string"}, {"name": "start_equipment_factor", "type": "string"}, {"name": "start_manpower_factor", "type": "string"}, {"name": "force_equipment_variants", "type": "string"}],
    },
        {
        key: "teleport_armies",
        params: [{"name": "limit", "type": "string"}, {"name": "to_state_array", "type": "string"}],
    },
        {
        key: "add_province_modifier",
        params: [{"name": "static_modifiers", "type": "string"}],
    },
        {
        key: "remove_province_modifier",
        params: [{"name": "static_modifiers", "type": "string"}],
    },
        {
        key: "add_victory_points",
    },
        {
        key: "set_victory_points",
    },
        {
        key: "set_state_province_controller",
        params: [{"name": "controller", "type": "country_tag"}, {"name": "limit", "type": "string"}],
    },
        {
        key: "transfer_state_to",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "set_state_owner_to",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "set_state_controller_to",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "strategic_province_location",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "strategic_state_location",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_extra_state_shared_building_slots",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_building_construction",
        params: [{"name": "type", "type": "string"}, {"name": "level", "type": "number"}, {"name": "instant_build", "type": "bool"}, {"name": "province", "type": "string"}, {"name": "all_provinces", "type": "bool"}, {"name": "id", "type": "string"}, {"name": "limit_to_coastal", "type": "bool"}, {"name": "limit_to_naval_base", "type": "bool"}, {"name": "limit_to_border", "type": "bool"}, {"name": "limit_to_border_country", "type": "country_tag"}, {"name": "limit_to_victory_point", "type": "number"}, {"name": "limit_to_supply_node", "type": "bool"}, {"name": "level", "type": "number"}],
    },
        {
        key: "set_building_level",
        params: [{"name": "type", "type": "string"}, {"name": "level", "type": "number"}, {"name": "instant_build", "type": "bool"}, {"name": "province", "type": "string"}, {"name": "all_provinces", "type": "bool"}, {"name": "id", "type": "string"}, {"name": "limit_to_coastal", "type": "bool"}, {"name": "limit_to_naval_base", "type": "bool"}, {"name": "limit_to_border", "type": "bool"}, {"name": "limit_to_border_country", "type": "country_tag"}, {"name": "limit_to_victory_point", "type": "number"}, {"name": "limit_to_supply_node", "type": "bool"}, {"name": "level", "type": "number"}],
    },
        {
        key: "remove_building",
        params: [{"name": "type", "type": "string"}, {"name": "tag", "type": "country_tag"}, {"name": "tag", "type": "string"}, {"name": "level", "type": "number"}],
    },
        {
        key: "construct_building_in_random_province",
        params: [{"name": "value", "type": "string"}, {"name": "65", "type": "string"}],
    },
        {
        key: "add_compliance",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_resistance",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_resistance_target",
        params: [{"name": "id", "type": "number"}],
    },
        {
        key: "cancel_resistance",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "force_disable_resistance",
        params: [{"name": "clear", "type": "bool"}],
    },
        {
        key: "force_enable_resistance",
        params: [{"name": "clear", "type": "bool"}],
    },
        {
        key: "remove_resistance_target",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "set_compliance",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "set_resistance",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "start_resistance",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "set_garrison_strength",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "raid_reduce_project_progress_ratio",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "set_character_flag",
        params: [{"name": "value", "type": "string"}, {"name": "flag", "type": "string"}, {"name": "days", "type": "number", "required": false}, {"name": "value", "type": "number"}],
    },
        {
        key: "modify_character_flag",
        params: [{"name": "flag", "type": "string"}, {"name": "value", "type": "string"}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "clr_character_flag",
    },
        {
        key: "retire",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "set_portraits",
        params: [{"name": "character", "type": "string", "required": false}],
    },
        {
        key: "add_scientist_level",
        params: [{"name": "level", "type": "number"}, {"name": "specialization", "type": "string"}],
    },
        {
        key: "injure_scientist_for_days",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_scientist_trait",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_scientist_xp",
        params: [{"name": "experience", "type": "number"}, {"name": "specialization", "type": "string"}],
    },
        {
        key: "unit_leader_event",
        params: [{"name": "id", "type": "event_id"}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "set_unit_leader_flag",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "clr_unit_leader_flag",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "modify_unit_leader_flag",
        params: [{"name": "flag", "type": "string"}, {"name": "value", "type": "string"}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "promote_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "demote_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "add_unit_leader_trait",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "remove_unit_leader_trait",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_random_trait",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_timed_unit_leader_trait",
        params: [{"name": "value", "type": "string"}, {"name": "days", "type": "number"}],
    },
        {
        key: "replace_unit_leader_trait",
        params: [{"name": "trait", "type": "string"}, {"name": "replace", "type": "string"}],
    },
        {
        key: "remove_exile_tag",
    },
        {
        key: "gain_xp",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "remove_unit_leader_role",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "swap_country_leader_traits",
        params: [{"name": "remove", "type": "string"}, {"name": "add", "type": "string"}, {"name": "ideology", "type": "ideology"}],
    },
        {
        key: "supply_units",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_max_trait",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_skill_level",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_logistics",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_planning",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_defense",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_attack",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_coordination",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_maneuver",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_temporary_buff_to_units",
        params: [{"name": "combat_offense", "type": "float", "required": false}, {"name": "combat_breakthrough", "type": "float", "required": false}],
    },
        {
        key: "add_nationality",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "force_operative_leader_into_hiding",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "harm_operative_leader",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "operative_leader_event",
        params: [{"name": "id", "type": "event_id"}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "destroy_unit",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "add_history_entry",
        params: [{"name": "key", "type": "localisation_key"}, {"name": "subject", "type": "string"}, {"name": "allow", "type": "bool"}],
    },
        {
        key: "change_division_template",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_random_valid_trait_from_unit",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_unit_medal_to_latest_entry",
        params: [{"name": "unit_medals", "type": "string"}],
    },
        {
        key: "add_divisional_commander_xp",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "reseed_division_commander",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "promote_officer_to_general",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "set_unit_organization",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "add_mio_funds",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "set_mio_funds",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_mio_funds_gain_factor",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "set_mio_funds_gain_factor",
        params: [{"name": "value", "type": "float"}, {"name": "set_mio_funds", "type": "string"}],
    },
        {
        key: "add_mio_size",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_mio_size_up_requirement_factor",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "set_mio_size_up_requirement_factor",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "add_mio_task_capacity",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "set_mio_task_capacity",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "add_mio_research_bonus",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "set_mio_research_bonus",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "set_mio_name_key",
        params: [{"name": "value", "type": "localisation_key"}],
    },
        {
        key: "set_mio_icon",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "add_mio_design_team_assign_cost",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "set_mio_design_team_assign_cost",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "add_mio_industrial_manufacturer_assign_cost",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "set_mio_industrial_manufacturer_assign_cost",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "add_mio_design_team_change_cost",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "set_mio_design_team_change_cost",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "unlock_mio_trait_tooltip",
        params: [{"name": "value", "type": "string"}, {"name": "trait", "type": "string"}, {"name": "show_modifiers", "type": "bool"}],
    },
        {
        key: "complete_mio_trait",
        params: [{"name": "value", "type": "string"}, {"name": "trait", "type": "string"}, {"name": "show_modifiers", "type": "bool"}],
    },
        {
        key: "set_mio_flag",
        params: [{"name": "value", "type": "string"}, {"name": "flag", "type": "string"}, {"name": "days", "type": "number", "required": false}, {"name": "value", "type": "number"}],
    },
        {
        key: "clr_mio_flag",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "modify_mio_flag",
        params: [{"name": "flag", "type": "string"}, {"name": "value", "type": "string"}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "cancel_purchase_contract",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "add_raid_history_entry",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "raid_add_unit_experience",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "raid_damage_units",
        params: [{"name": "value", "type": "string"}, {"name": "damage", "type": "float"}, {"name": "org_damage", "type": "float"}, {"name": "str_damage", "type": "float"}, {"name": "plane_loss", "type": "float"}, {"name": "ratio", "type": "bool", "required": false}],
    },
        {
        key: "add_project_progress_ratio",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "complete_prototype_reward_option",
        params: [{"name": "prototype_reward", "type": "string"}, {"name": "prototyp_reward_option", "type": "string", "required": false}, {"name": "show_modifiers", "type": "bool"}],
    },
        {
        key: "set_project_flag",
        params: [{"name": "value", "type": "string"}, {"name": "flag", "type": "string"}, {"name": "days", "type": "number", "required": false}, {"name": "value", "type": "number"}],
    },
        {
        key: "clr_project_flag",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "modify_project_flag",
        params: [{"name": "flag", "type": "string"}, {"name": "value", "type": "string"}, {"name": "days", "type": "number", "required": false}, {"name": "modify_mproject_flag", "type": "string"}, {"name": "flag", "type": "string"}, {"name": "value", "type": "string"}],
    },
        {
        key: "execute_operation_coordinated_strike",
        params: [{"name": "amount", "type": "number"}],
    },
        {
        key: "instantiate_collaboration_government",
    },
        {
        key: "add_potential_special_forces_tree",
    },
        {
        key: "upgrade_economy_law",
    },
        {
        key: "gain_random_agency_upgrade",
    },
        {
        key: "add_ruling_to_dem",
    },
        {
        key: "remove_any_country_role_from_character",
    },
        {
        key: "increase_state_category",
    },
        {
        key: "lerp",
        params: [{"name": "...", "type": "scope_block"}],
    },
        {
        key: "store_core_states_on_game_start",
    },
];

const HOI4_TRIGGERS = [
    {
        key: "has_war",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "is_at_war",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "tag",
        params: [{"name": "value", "type": "country_tag"}],
    },
    {
        key: "original_tag",
        params: [{"name": "value", "type": "country_tag"}],
    },
    {
        key: "is_puppet",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "is_subject",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "is_faction_leader",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "is_major",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "is_in_faction",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "is_in_faction_with",
        params: [{"name": "tag", "type": "country_tag"}],
    },
    {
        key: "in_faction_with",
        params: [{"name": "tag", "type": "country_tag"}],
    },
    {
        key: "has_dlc",
        params: [{"name": "value", "type": "string"}],
    },
    {
        key: "has_completed_focus",
        params: [{"name": "focus", "type": "string"}],
    },
    {
        key: "has_country_flag",
        params: [{"name": "value", "type": "string"}],
    },
    {
        key: "has_global_flag",
        params: [{"name": "value", "type": "string"}],
    },
    {
        key: "has_idea",
        params: [{"name": "idea", "type": "idea_token"}],
    },
    {
        key: "has_government",
        params: [{"name": "value", "type": "ideology"}],
    },
    {
        key: "has_political_power",
        params: [{"name": "value", "type": "comparison", "default": "> 50"}],
    },
    {
        key: "has_stability",
        params: [{"name": "value", "type": "comparison", "default": "> 0.5"}],
    },
    {
        key: "has_war_support",
        params: [{"name": "value", "type": "comparison", "default": "> 0.5"}],
    },
    {
        key: "has_manpower",
        params: [{"name": "value", "type": "comparison", "default": "> 10000"}],
    },
    {
        key: "political_power_daily",
        params: [{"name": "value", "type": "comparison", "default": "> 1"}],
    },
    {
        key: "has_tech",
        params: [{"name": "value", "type": "string"}],
    },
    {
        key: "has_army_size",
        params: [{"name": "size", "type": "comparison", "default": "> 100"}, {"name": "type", "type": "string"}],
    },
    {
        key: "num_of_factories",
        params: [{"name": "value", "type": "comparison", "default": "> 10"}],
    },
    {
        key: "num_of_civilian_factories",
        params: [{"name": "value", "type": "comparison", "default": "> 5"}],
    },
    {
        key: "num_of_military_factories",
        params: [{"name": "value", "type": "comparison", "default": "> 5"}],
    },
    {
        key: "controls_state",
        params: [{"name": "value", "type": "state_id"}],
    },
    {
        key: "has_full_control_of_state",
        params: [{"name": "value", "type": "state_id"}],
    },
    {
        key: "owns_state",
        params: [{"name": "value", "type": "state_id"}],
    },
    {
        key: "is_core_of",
        params: [{"name": "tag", "type": "country_tag"}],
    },
    {
        key: "is_in_peace_conference",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "strength_ratio",
        params: [{"name": "tag", "type": "country_tag"}, {"name": "ratio", "type": "float", "default": 1.0}],
    },
    {
        key: "alliance_strength_ratio",
        params: [{"name": "value", "type": "comparison", "default": "> 1"}],
    },
    {
        key: "has_opinion",
        params: [{"name": "target", "type": "country_tag"}, {"name": "value", "type": "comparison", "default": "> 0"}],
    },
    {
        key: "is_neighbor_of",
        params: [{"name": "country", "type": "country_tag"}],
    },
    {
        key: "always",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "date",
        params: [{"name": "value", "type": "comparison", "default": "> 1939.1.1"}],
    },
    {
        key: "check_variable",
        params: [{"name": "var", "type": "string"}, {"name": "value", "type": "comparison", "default": "> 0"}],
    },
    {
        key: "has_variable",
        params: [{"name": "value", "type": "string"}],
    },
    {
        key: "not",
        params: [{"name": "...", "type": "scope_block"}],
    },
    {
        key: "and",
        params: [{"name": "...", "type": "scope_block"}],
    },
    {
        key: "or",
        params: [{"name": "...", "type": "scope_block"}],
    },
    {
        key: "if",
        params: [{"name": "limit", "type": "scope_block"}, {"name": "...", "type": "scope_block"}],
    },
    {
        key: "custom_trigger_tooltip",
        params: [{"name": "tooltip", "type": "localisation_key"}, {"name": "...", "type": "scope_block"}],
    },
    {
        key: "has_character",
        params: [{"name": "value", "type": "string"}],
    },
    {
        key: "has_country_leader",
        params: [{"name": "name", "type": "string"}, {"name": "ruling_only", "type": "bool", "default": "yes"}],
    },
    {
        key: "is_democratic",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "is_fascism",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "is_communism",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
        {
        key: "has_start_date",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "difficulty",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_any_custom_difficulty_setting",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_custom_difficulty_setting",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "game_rules_allow_achievements",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "country_exists",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_ironman",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_historical_focus_on",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_tutorial",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_debug",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "threat",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_game_rule",
        params: [{"name": "value", "type": "string"}, {"name": "value", "type": "string"}],
    },
        {
        key: "has_completed_custom_achievement",
        params: [{"name": "mod", "type": "string"}, {"name": "achievement", "type": "string"}],
    },
        {
        key: "career_profile_check_medal",
        params: [{"name": "medal", "type": "string"}],
    },
        {
        key: "career_profile_check_ribbon",
        params: [{"name": "ribbon", "type": "string"}, {"name": "tooltip", "type": "localisation_key", "required": false}],
    },
        {
        key: "career_profile_check_playthrough_ratio",
        params: [{"name": "frits", "type": "string"}, {"name": "second", "type": "string"}, {"name": "ratio", "type": "number"}, {"name": "compare", "type": "string"}],
    },
        {
        key: "career_profile_check_playthrough_value",
        params: [{"name": "var", "type": "string"}, {"name": "value", "type": "number"}, {"name": "compare", "type": "string", "required": false}, {"name": "tooltip", "type": "localisation_key", "required": false}, {"name": "tooltip_value", "type": "number", "required": false}],
    },
        {
        key: "career_profile_check_points",
        params: [{"name": "value", "type": "number"}, {"name": "compare", "type": "string"}, {"name": "tooltip", "type": "localisation_key", "required": false}],
    },
        {
        key: "career_profile_check_ratio",
    },
        {
        key: "career_profile_check_value",
    },
        {
        key: "career_profile_has_player_flag",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "print_variables",
        params: [{"name": "print_global", "type": "bool"}, {"name": "var_list", "type": "string"}, {"name": "file", "type": "string"}, {"name": "text", "type": "string"}, {"name": "append", "type": "bool"}],
    },
        {
        key: "exists",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_ai",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_collaboration",
        params: [{"name": "target", "type": "country_tag"}],
    },
        {
        key: "has_cosmetic_tag",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_event_target",
        params: [{"name": "value", "type": "event_id"}],
    },
        {
        key: "has_decision",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_dynamic_modifier",
        params: [{"name": "modifier", "type": "string"}, {"name": "scope", "type": "scope_block", "required": false}],
    },
        {
        key: "has_active_mission",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_country_custom_difficulty_setting",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_terrain",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "is_dynamic_country",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "num_of_supply_nodes",
        params: [{"name": "value", "type": "number"}, {"name": "value", "type": "string"}, {"name": "value", "type": "number"}],
    },
        {
        key: "has_resources_in_country",
        params: [{"name": "resource", "type": "string"}, {"name": "amount", "type": "number"}, {"name": "extracted", "type": "bool", "required": false}, {"name": "buildings", "type": "bool", "required": false}],
    },
        {
        key: "has_focus_tree",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "focus_progress",
        params: [{"name": "focus", "type": "string"}, {"name": "progress", "type": "string"}],
    },
        {
        key: "has_shine_effect_on_focus",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "political_power_growth",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "command_power",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "command_power_daily",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_elections",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_staging_coup",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_target_of_coup",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_civil_war",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "civilwar_target",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_manpower_for_recruit_change_to",
        params: [{"name": "value", "type": "float"}, {"name": "group", "type": "string"}],
    },
        {
        key: "has_rule",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_casualties_war_support",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_convoys_war_support",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_bombing_war_support",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_power_balance",
        params: [{"name": "id", "type": "string"}],
    },
        {
        key: "has_any_power_balance",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "power_balance_value",
        params: [{"name": "id", "type": "string"}, {"name": "value", "type": "float"}],
    },
        {
        key: "power_balance_daily_change",
        params: [{"name": "id", "type": "string"}, {"name": "value", "type": "float"}],
    },
        {
        key: "power_balance_weekly_change",
        params: [{"name": "id", "type": "string"}, {"name": "value", "type": "float"}],
    },
        {
        key: "is_power_balance_in_range",
        params: [{"name": "id", "type": "string"}, {"name": "range", "type": "string"}],
    },
        {
        key: "is_power_balance_side_active",
        params: [{"name": "id", "type": "string"}, {"name": "side", "type": "string"}],
    },
        {
        key: "has_power_balance_modifier",
        params: [{"name": "id", "type": "string"}, {"name": "modifier", "type": "string"}],
    },
        {
        key: "num_of_naval_factories",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_of_available_military_factories",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_of_available_civilian_factories",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_of_available_naval_factories",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_of_controlled_factories",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_of_owned_factories",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_of_civilian_factories_available_for_projects",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "ic_ratio",
        params: [{"name": "tag", "type": "scope_block"}, {"name": "ratio", "type": "float"}],
    },
        {
        key: "has_damaged_buildings",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_built",
        params: [{"name": "type", "type": "string"}, {"name": "value", "type": "number"}],
    },
        {
        key: "is_researching_technology",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "can_research",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "original_research_slots",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "amount_research_slots",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "is_in_tech_sharing_group",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "num_tech_sharing_groups",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_tech_bonus",
        params: [{"name": "technology", "type": "string", "required": false}, {"name": "category", "type": "string", "required": false}],
    },
        {
        key: "land_doctrine_level",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_researched_technologies",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "is_special_project_being_researched",
    },
        {
        key: "is_special_project_completed",
    },
        {
        key: "has_idea_with_trait",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_allowed_idea_with_traits",
        params: [{"name": "idea", "type": "string"}, {"name": "limit", "type": "number"}, {"name": "characters", "type": "bool"}, {"name": "ignore", "type": "string", "required": false}, {"name": "has_available_idea_with_traits", "type": "string"}, {"name": "idea", "type": "string"}, {"name": "limit", "type": "string"}, {"name": "ignore", "type": "string"}, {"name": "ignore", "type": "string"}],
    },
        {
        key: "has_available_idea_with_traits",
        params: [{"name": "idea", "type": "string"}, {"name": "limit", "type": "number"}, {"name": "characters", "type": "bool"}, {"name": "ignore", "type": "string", "required": false}],
    },
        {
        key: "amount_taken_ideas",
        params: [{"name": "amount", "type": "number"}, {"name": "slots", "type": "string"}],
    },
        {
        key: "is_ally_with",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_spymaster",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_non_aggression_pact_with",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_guaranteed_by",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_guaranteed",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_military_access_to",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "gives_military_access_to",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_owner_neighbor_of",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_puppet_of",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_subject_of",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_subject",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "num_subjects",
        params: [{"name": "value", "type": "number"}],
    },
            {
        key: "has_autonomy_state",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "compare_autonomy_state",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "compare_autonomy_progress_ratio",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_opinion_modifier",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_relation_modifier",
        params: [{"name": "target", "type": "scope_block"}, {"name": "modifier", "type": "string"}],
    },
        {
        key: "has_legitimacy",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "is_exile_host",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_hosting_exile",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "is_government_in_exile",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_exiled_in",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "received_expeditionary_forces",
        params: [{"name": "sender", "type": "country_tag"}],
    },
        {
        key: "can_declare_war_on",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "foreign_manpower",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "is_embargoed_by",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_embargoing",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "num_faction_members",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_manpower_to_become_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_industry_to_become_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_enough_influence_for_leadership",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_faction_template",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_active_rule",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_faction_goal",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_completed_faction_goal",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "faction_goal_fulfillment",
        params: [{"name": "goal", "type": "string"}, {"name": "value", "type": "float"}],
    },
        {
        key: "faction_manifest_fulfillment",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "faction_upgrade_level",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "faction_power_projection",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "faction_influence_rank",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "faction_influence_ratio",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "faction_influence_score",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "can_assign_supportive_scientist_to_faction",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_faction_research_unlocked",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_faction_military_unlocked",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "compare_ideology_with_faction",
        params: [{"name": "value", "type": "float"}, {"name": "leader", "type": "country_tag"}],
    },
        {
        key: "has_war_with",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_offensive_war_with",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_offensive_war_without_friend",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_defensive_war_with",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_offensive_war",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_defensive_war",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_war_together_with",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_war_with_major",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_war_with_wargoal_against",
        params: [{"name": "target", "type": "scope_block"}, {"name": "type", "type": "string", "required": false}],
    },
        {
        key: "surrender_progress",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_capitulated",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "days_since_capitulated",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_border_war_with",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_border_war_between",
        params: [{"name": "attacker", "type": "scope_block"}, {"name": "defender", "type": "scope_block"}],
    },
        {
        key: "has_border_war",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_added_tension_amount",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_wargoal_against",
        params: [{"name": "target", "type": "scope_block"}, {"name": "type", "type": "string"}],
    },
        {
        key: "is_justifying_wargoal_against",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_annex_war_goal",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "controls_province",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "longest_war_length",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "war_length_with",
        params: [{"name": "tag", "type": "scope_block"}, {"name": "months", "type": "number"}],
    },
        {
        key: "has_truce_with",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_naval_control",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_enemy_naval_control",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "num_of_controlled_states",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_occupied_states",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_resources_rights",
        params: [{"name": "receiver", "type": "scope_block"}, {"name": "resources", "type": "string", "required": false}],
    },
        {
        key: "core_compliance",
        params: [{"name": "occupied_country_tag", "type": "country_tag"}, {"name": "value", "type": "number"}],
    },
        {
        key: "core_resistance",
        params: [{"name": "occupied_country_tag", "type": "country_tag"}, {"name": "value", "type": "number"}],
    },
        {
        key: "garrison_manpower_need",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_core_occupation_modifier",
        params: [{"name": "occupied_country_tag", "type": "scope_block"}, {"name": "modifier", "type": "string"}],
    },
        {
        key: "occupation_law",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_contested_owner",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "owns_any_state_of",
        params: [{"name": "value", "type": "state_id"}],
    },
        {
        key: "is_on_same_continent_as",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_army_experience",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_air_experience",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_navy_experience",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_army_manpower",
        params: [{"name": "size", "type": "number"}],
    },
        {
        key: "manpower_per_military_factory",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "conscription_ratio",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "current_conscription_amount",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "target_conscription_amount",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "num_divisions",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_of_nukes",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "casualties",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "casualties_k",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "casualties_inflicted_by",
        params: [{"name": "opponent", "type": "country_tag"}],
    },
        {
        key: "amount_manpower_in_deployment_queue",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_attache_from",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_attache",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_lend_leasing",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "has_template",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_template_majority_unit",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_template_containing_unit",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "fighting_army_strength_ratio",
        params: [{"name": "tag", "type": "scope_block"}],
    },
        {
        key: "naval_strength_ratio",
        params: [{"name": "tag", "type": "scope_block"}],
    },
        {
        key: "naval_strength_comparison",
        params: [{"name": "other", "type": "scope_block"}, {"name": "tooltip", "type": "string", "required": false}, {"name": "sub_unit_def_weights", "type": "string", "required": false}],
    },
        {
        key: "alliance_naval_strength_ratio",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "enemies_strength_ratio",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "enemies_naval_strength_ratio",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_navy_size",
        params: [{"name": "size", "type": "float"}, {"name": "type", "type": "string", "required": false}, {"name": "archetype", "type": "string", "required": false}],
    },
        {
        key: "has_deployed_air_force_size",
        params: [{"name": "size", "type": "float"}, {"name": "type", "type": "string", "required": false}],
    },
        {
        key: "divisions_in_state",
        params: [{"name": "size", "type": "float"}, {"name": "type", "type": "string", "required": false}, {"name": "unit", "type": "string", "required": false}, {"name": "state", "type": "scope_block"}],
    },
        {
        key: "army_manpower_in_state",
        params: [{"name": "type", "type": "string", "required": false}, {"name": "state", "type": "scope_block"}],
    },
        {
        key: "divisions_in_border_state",
        params: [{"name": "size", "type": "float"}, {"name": "type", "type": "string", "required": false}, {"name": "state", "type": "scope_block"}, {"name": "border_state", "type": "scope_block"}],
    },
        {
        key: "num_divisions_in_states",
        params: [{"name": "count", "type": "number"}, {"name": "states", "type": "string"}, {"name": "types", "type": "string", "required": false}, {"name": "exclude", "type": "string", "required": false}],
    },
        {
        key: "num_battalions_in_states",
        params: [{"name": "count", "type": "number"}, {"name": "states", "type": "string"}, {"name": "types", "type": "string"}, {"name": "exclude", "type": "string"}],
    },
        {
        key: "ships_in_state_ports",
        params: [{"name": "size", "type": "float"}, {"name": "type", "type": "string", "required": false}, {"name": "state", "type": "scope_block"}],
    },
        {
        key: "num_planes_stationed_in_regions",
        params: [{"name": "value", "type": "float"}, {"name": "regions", "type": "string"}],
    },
        {
        key: "has_volunteers_amount_from",
        params: [{"name": "tag", "type": "scope_block"}, {"name": "count", "type": "number"}],
    },
        {
        key: "convoy_threat",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_mined",
        params: [{"name": "target", "type": "country_tag"}],
    },
        {
        key: "has_mines",
        params: [{"name": "region", "type": "string"}, {"name": "amount", "type": "number"}, {"name": "has_mined", "type": "string"}, {"name": "target", "type": "string"}, {"name": "amount", "type": "string"}],
    },
        {
        key: "mine_threat",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_military_industrial_organization",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_tactic",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_any_grand_doctrine",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_doctrine",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_subdoctrine_in_track",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_completed_subdoctrine",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_completed_track",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_mastery",
        params: [{"name": "amount", "type": "number"}, {"name": "track", "type": "string"}],
    },
        {
        key: "has_mastery_level",
        params: [{"name": "amount", "type": "number"}, {"name": "subdoctrine", "type": "string"}],
    },
        {
        key: "stockpile_ratio",
        params: [{"name": "archetype", "type": "string"}, {"name": "ratio", "type": "float"}],
    },
        {
        key: "has_equipment",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_any_license",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_licensing_any_to",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_licensing_to",
        params: [{"name": "target", "type": "scope_block"}, {"name": "archetype", "type": "string", "required": false}, {"name": "type", "type": "string", "required": false}, {"name": "version", "type": "number", "required": false}],
    },
        {
        key: "has_license",
        params: [{"name": "from", "type": "scope_block"}, {"name": "archetype", "type": "string", "required": false}, {"name": "type", "type": "string", "required": false}, {"name": "version", "type": "number", "required": false}],
    },
        {
        key: "fuel_ratio",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_fuel",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_design_based_on",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "estimated_intel_max_piercing",
        params: [{"name": "tag", "type": "scope_block"}, {"name": "value", "type": "number"}],
    },
        {
        key: "estimated_intel_max_armor",
        params: [{"name": "tag", "type": "scope_block"}, {"name": "value", "type": "number"}],
    },
        {
        key: "compare_intel_with",
        params: [{"name": "target", "type": "country_tag"}],
    },
        {
        key: "intel_level_over",
        params: [{"name": "target", "type": "country_tag"}],
    },
        {
        key: "has_intelligence_agency",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "network_national_coverage",
        params: [{"name": "target", "type": "country_tag"}],
    },
        {
        key: "network_strength",
        params: [{"name": "target", "type": "country_tag"}, {"name": "state", "type": "string"}],
    },
        {
        key: "has_done_agency_upgrade",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "agency_upgrade_number",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "decryption_progress",
        params: [{"name": "target", "type": "country_tag"}],
    },
        {
        key: "has_captured_operative",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "has_finished_collecting_for_operation",
        params: [{"name": "target", "type": "country_tag"}, {"name": "operation", "type": "string"}],
    },
        {
        key: "is_preparing_operation",
        params: [{"name": "target", "type": "country_tag"}, {"name": "operation", "type": "string", "required": false}],
    },
        {
        key: "is_running_operation",
        params: [{"name": "target", "type": "country_tag"}, {"name": "operation", "type": "string", "required": false}],
    },
        {
        key: "num_finished_operations",
        params: [{"name": "target", "type": "country_tag"}, {"name": "operation", "type": "string", "required": false}],
    },
        {
        key: "has_operation_token",
        params: [{"name": "tag", "type": "country_tag"}, {"name": "token", "type": "string"}],
    },
        {
        key: "is_active_decryption_bonuses_enabled",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "is_cryptology_department_active",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_decrypting",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "is_fully_decrypted",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "num_fake_intel_divisions",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_free_operative_slots",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_operative_slots",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_of_operatives",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "ai_irrationality",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "ai_liberate_desire",
        params: [{"name": "target", "type": "scope_block"}, {"name": "count", "type": "float"}],
    },
        {
        key: "ai_has_role_division",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "ai_has_role_template",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "ai_wants_divisions",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_template_ai_majority_unit",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "can_be_country_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_country_leader_ideology",
        params: [{"name": "value", "type": "ideology"}],
    },
        {
        key: "has_country_leader_with_trait",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "is_female",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_unit_leader",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_scientist_specialization",
        params: [{"name": "specialization", "type": "string"}],
    },
        {
        key: "pc_is_winner",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "pc_is_on_winning_side",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "pc_is_loser",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "pc_is_untouched_loser",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "pc_is_on_same_side_as",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "pc_is_liberated",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "pc_is_liberated_by",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "pc_is_puppeted",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "pc_is_puppeted_by",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "pc_is_forced_government",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "pc_is_forced_government_by",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "pc_is_forced_government_to",
        params: [{"name": "value", "type": "ideology"}],
    },
        {
        key: "pc_total_score",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "pc_current_score",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "state",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "region",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "free_building_slots",
        params: [{"name": "building", "type": "string"}, {"name": "size", "type": "number"}, {"name": "include_locked", "type": "bool"}],
    },
        {
        key: "non_damaged_building_level",
        params: [{"name": "building", "type": "string"}, {"name": "level", "type": "number"}],
    },
        {
        key: "has_state_flag",
        params: [{"name": "flag", "type": "string"}, {"name": "value", "type": "number", "required": false}, {"name": "date", "type": "string", "required": false}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "state_population",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "state_population_k",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "is_capital",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_controlled_by",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_fully_controlled_by",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_owned_by",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_claimed_by",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_owned_and_controlled_by",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_demilitarized_zone",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_border_conflict",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_in_home_area",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_coastal",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_one_state_island",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_island_state",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_on_continent",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "impassable",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_state_category",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "state_strategic_value",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "state_and_terrain_strategic_value",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "num_owned_neighbour_states",
        params: [{"name": "owner", "type": "scope_block"}, {"name": "count", "type": "number"}],
    },
        {
        key: "distance_to",
        params: [{"name": "value", "type": "float"}, {"name": "target", "type": "scope_block"}],
    },
        {
        key: "ships_in_area",
        params: [{"name": "area", "type": "number"}, {"name": "size", "type": "number"}],
    },
        {
        key: "has_resources_amount",
        params: [{"name": "resource", "type": "string"}, {"name": "amount", "type": "number"}, {"name": "delivered", "type": "bool"}],
    },
        {
        key: "days_since_last_strategic_bombing",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_railway_connection",
        params: [{"name": "value", "type": "scope_block"}, {"name": "value", "type": "string"}],
    },
        {
        key: "can_build_railway",
        params: [{"name": "value", "type": "scope_block"}, {"name": "value", "type": "string"}],
    },
        {
        key: "has_railway_level",
        params: [{"name": "value", "type": "scope_block"}, {"name": "value", "type": "number"}],
    },
        {
        key: "pc_does_state_stack_demilitarized",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "pc_does_state_stack_dismantled",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "pc_is_state_claimed",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "pc_is_state_claimed_by",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "pc_is_state_claimed_and_taken_by",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "pc_is_state_outside_influence_for_winner",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "pc_turn",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "can_construct_building",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "compliance",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "compliance_speed",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_active_resistance",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_resistance",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "resistance",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "resistance_speed",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "resistance_target",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_occupation_modifier",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "occupied_country_tag",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "is_character",
        params: [{"name": "value", "type": "scope_block"}],
    },
        {
        key: "is_country_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_unit_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_advisor",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_air_chief",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_army_chief",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_army_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_navy_chief",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_navy_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_high_command",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_corps_commander",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_operative",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_political_advisor",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_theorist",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_character_slot",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_air_ledger",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_army_ledger",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_navy_ledger",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_character_flag",
        params: [{"name": "flag", "type": "string"}, {"name": "value", "type": "number", "required": false}, {"name": "date", "type": "string", "required": false}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "has_trait",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_id",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "is_hired_as_advisor",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "not_already_hired_except_as",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "advisor_can_be_fired",
        params: [{"name": "value", "type": "bool"}, {"name": "slot", "type": "string"}],
    },
        {
        key: "has_advisor_role",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_ideology",
        params: [{"name": "value", "type": "ideology"}],
    },
        {
        key: "has_ideology_group",
        params: [{"name": "value", "type": "ideology"}],
    },
        {
        key: "has_unit_leader_flag",
        params: [{"name": "flag", "type": "string"}, {"name": "value", "type": "number", "required": false}, {"name": "date", "type": "string", "required": false}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "is_leading_army",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_leading_army_group",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_leading_volunteer_group",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "is_leading_volunteer_group_with_original_country",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "is_field_marshal",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_assigned",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "can_select_trait",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_ability",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "skill",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "skill_advantage",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "planning_skill_level",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "logistics_skill_level",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "defense_skill_level",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "attack_skill_level",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "average_stats",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "is_border_war",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "num_units",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "is_exiled_leader",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_exiled_leader_from",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "is_leading_army_in_province",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_nationality",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "is_operative_captured",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "operative_leader_mission",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "operative_leader_operation",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_scientist_level",
        params: [{"name": "level", "type": "number"}, {"name": "specialization", "type": "string"}],
    },
        {
        key: "is_active_scientist",
        params: [{"name": "value", "type": "bool"}, {"name": "is_scientist_active", "type": "bool"}],
    },
        {
        key: "is_scientist_injured",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "hardness",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "armor",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "dig_in",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "min_planning",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "fastest_unit",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "temperature",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "reserves",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_combat_modifier",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "is_fighting_in_terrain",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "is_fighting_in_weather",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "phase",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "recon_advantage",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "night",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "frontage_full",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_flanked_opponent",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_max_planning",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_reserves",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_amphibious_invasion",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_attacker",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_defender",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_winning",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_fighting_air_units",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "less_combat_width_than_opponent",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_carrier_airwings_on_mission",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_carrier_airwings_in_own_combat",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_artillery_ratio",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "has_unit_type",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "division_has_majority_template",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "division_has_battalion_in_template",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "unit_strength",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "unit_organization",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "is_unit_template_reserves",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_officer_name",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "is_military_industrial_organization",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "is_mio_visible",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_mio_available",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "is_mio_assigned_to_task",
        params: [{"name": "value", "type": "bool"}],
    },
        {
        key: "has_mio_size",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_mio_trait",
        params: [{"name": "value", "type": "string"}, {"name": "trait", "type": "string"}],
    },
        {
        key: "is_mio_trait_available",
        params: [{"name": "value", "type": "string"}, {"name": "trait", "type": "string"}, {"name": "check_mio_parent_completed", "type": "bool"}, {"name": "check_mio_mutually_exclusive", "type": "bool"}],
    },
        {
        key: "is_mio_trait_completed",
        params: [{"name": "value", "type": "string"}, {"name": "trait", "type": "string"}],
    },
        {
        key: "has_mio_number_of_completed_traits",
        params: [{"name": "value", "type": "number"}],
    },
        {
        key: "has_mio_flag",
        params: [{"name": "flag", "type": "string"}, {"name": "value", "type": "number", "required": false}, {"name": "date", "type": "string", "required": false}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "has_mio_policy",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_mio_policy_active",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_mio_research_category",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "has_mio_equipment_type",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "contract_contains_equipment",
        params: [{"name": "value", "type": "string"}],
    },
        {
        key: "deal_completion",
        params: [{"name": "value", "type": "float"}],
    },
        {
        key: "seller",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "buyer",
        params: [{"name": "value", "type": "country_tag"}],
    },
        {
        key: "has_project_flag",
        params: [{"name": "value", "type": "string"}, {"name": "flag", "type": "string"}, {"name": "value", "type": "number", "required": false}, {"name": "date", "type": "string", "required": false}, {"name": "days", "type": "number", "required": false}],
    },
        {
        key: "is_free_or_subject_of_root",
    },
        {
        key: "has_same_ideology",
    },
        {
        key: "is_enemy_ideology",
    },
        {
        key: "controls_or_subject_of",
    },
        {
        key: "owns_or_subject_of",
    },
];

const HOI4_MODIFIERS = [
    {
        key: "monthly_population",
        label: "Changes the monthly population gain in states owned by the country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "nuclear_production",
        label: "Enables the production of nukes.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "nuclear_production_factor",
        label: "Changes speed at which nukes are produced.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "research_sharing_per_country_bonus",
        label: "Changes the bonus in research speed per country when technology sharing.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "research_sharing_per_country_bonus_factor",
        label: "Changes the bonus in research speed per country when technology sharing by a per",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "research_speed_factor",
        label: "Changes the research speed.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "local_resources_factor",
        label: "Resource extraction efficiency. Modifies the amount of available resources.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "surrender_limit",
        label: "Changes the percentage of victory points the country needs to lose control of to",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "max_surrender_limit_offset",
        label: "Controls the maximum surrender progress of a nation.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "forced_surrender_limit",
        label: "Changes the percentage of victory points the country needs to lose control of to",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "resource_trade_cost_bonus_per_factory",
        label: "Modifies the country's cost to buy resources from others.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "factory_energy_consumption",
        label: "Directly modifies the country's energy usage per factory",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "min_export",
        label: "Changes the amount of resources to market.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "trade_opinion_factor",
        label: "Makes AI more likely to purchase resources from this country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "defensive_war_stability_factor",
        label: "Changes the penalty to the stability invoked by participating in a defensive war",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "disabled_ideas",
        label: "Disables manually changing ideas (including ministers and laws).",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "unit_leader_as_advisor_cp_cost_factor",
        label: "Changes the cost in command power to turn a unit leader into an advisor.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "improve_relations_maintain_cost_factor",
        label: "Changes the cost in political power to maintain improvement of relations.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "female_random_country_leader_chance",
        label: "Changes the chance for a randomly-generated country leader to be female.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "offensive_war_stability_factor",
        label: "Modifies the stability penalty received from participating in an offensive war.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "party_popularity_stability_factor",
        label: "Modifies the stability gained by the popularity of the ruling party.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "political_power_cost",
        label: "Daily cost in political power.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "political_power_gain",
        label: "Modifies daily gain in political power.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "political_power_factor",
        label: "Modifies daily gain in political power by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "stability_factor",
        label: "Modifies stability of the country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "stability_weekly",
        label: "Modifies weekly stability gain of the country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "stability_weekly_factor",
        label: "Modifies weekly stability gain of the country by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "war_stability_factor",
        label: "Modifies the stability loss caused by being at war.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "war_support_factor",
        label: "Modifies war support of the country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "war_support_weekly",
        label: "Modifies weekly war support gain of the country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "war_support_weekly_factor",
        label: "Modifies weekly war support gain of the country by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "weekly_casualties_war_support",
        label: "Modifies weekly war support gain of the country depending on the casualties suff",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "weekly_convoys_war_support",
        label: "Modifies weekly war support gain of the country depending on the amount of its c",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "weekly_bombing_war_support",
        label: "Modifies weekly war support gain of the country depending on the enemy bombing o",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "drift_defence_factor",
        label: "Ideology drift defense.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "power_balance_daily",
        label: "Pushes the power balance by a specified amount on each day.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "power_balance_weekly",
        label: "Pushes the power balance by a specified amount on each week.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "civil_war_involvement_tension",
        label: "Changes the world tension amount necessary to intervene in an ally's civil war.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "enemy_declare_war_tension",
        label: "Changes the world tension required for an enemy to justify a wargoal on us.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "enemy_justify_war_goal_time",
        label: "Changes the time required for an enemy to justify a wargoal on us.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "faction_trade_opinion_factor",
        label: "Changes the opinion gain gained by trade between faction members.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "generate_wargoal_tension",
        label: "Changes the necessary tension for us to generate a wargoal.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "guarantee_cost",
        label: "Cost in political power for the country to guarantee an another country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "guarantee_tension",
        label: "Necessary world tension for the country to guarantee an another country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "join_faction_tension",
        label: "Necessary world tension for the country to join a faction.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "justify_war_goal_time",
        label: "The amount of time necessary to justify a wargoal.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "justify_war_goal_when_in_major_war_time",
        label: "The amount of time necessary to justify a wargoal when in a war with a major cou",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "lend_lease_tension",
        label: "Necessary world tension for the country to lend-lease.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "lend_lease_tension_with_overlord",
        label: "Necessary world tension for the country to lend-lease to its overlord.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "opinion_gain_monthly",
        label: "Changes opinion gain from the 'Improve relations' diplomatic action.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "opinion_gain_monthly_factor",
        label: "Changes opinion gain from the 'Improve relations' diplomatic action by a percent",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "opinion_gain_monthly_same_ideology",
        label: "Changes opinion gain from the 'Improve relations' diplomatic action for countrie",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "opinion_gain_monthly_same_ideology_factor",
        label: "Changes opinion gain from the 'Improve relations' diplomatic action for countrie",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "request_lease_tension",
        label: "Necessary world tension for the country to request lend-lease.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "annex_cost_factor",
        label: "Modifies the cost in victory points to annex states in peace deals.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "puppet_cost_factor",
        label: "Modifies the cost in victory points per state to puppet countries in peace deals",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "send_volunteer_divisions_required",
        label: "Changes the number of divisions needed to send volunteers.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "send_volunteer_factor",
        label: "Changes the number of divisions the country can send as volunteers by a percenta",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "send_volunteer_size",
        label: "Changes the number of divisions the country can send as volunteers.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "send_volunteers_tension",
        label: "Changes the world tension necessary for the country to send volunteers.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_volunteer_cap",
        label: "Changes the amount of airforce you can send as volunteers.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "embargo_threshold_factor",
        label: "Changes the necessary world tension level in order to be able to embargo a count",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "embargo_cost_factor",
        label: "Changes the cost in political power to send an embargo.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "autonomy_gain",
        label: "Daily gain of autonomy.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "autonomy_gain_global_factor",
        label: "Modifies all gain of autonomy by a subject.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "subjects_autonomy_gain",
        label: "Daily gain of autonomy in our subjects.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "autonomy_gain_ll_to_overlord",
        label: "Modifies gain of autonomy from lend-leasing to the overlord.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "autonomy_gain_ll_to_overlord_factor",
        label: "Modifies gain of autonomy from lend-leasing to the overlord by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "autonomy_gain_ll_to_subject",
        label: "Modifies loss of autonomy from lend-leasing to the subject.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "autonomy_gain_ll_to_subject_factor",
        label: "Modifies loss of autonomy from lend-leasing to the subject by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "autonomy_gain_trade",
        label: "Modifies gain of autonomy from the overlord trading with the subject.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "autonomy_gain_trade_factor",
        label: "Modifies gain of autonomy from the overlord trading with the subject by a percen",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "autonomy_gain_warscore",
        label: "Modifies gain of autonomy from the subject gaining warscore.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "autonomy_gain_warscore_factor",
        label: "Modifies gain of autonomy from the subject gaining warscore by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "autonomy_manpower_share",
        label: "Modifies the amount of manpower the overlord can use from the subject.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "can_master_build_for_us",
        label: "Makes the overlord be able to build in the subject.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "cic_to_overlord_factor",
        label: "Modifies the amount of the subject's civilian industry that goes to the overlord",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "mic_to_overlord_factor",
        label: "Modifies the amount of the subject's military industry that goes to the overlord",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "extra_trade_to_overlord_factor",
        label: "Modifies the amount of the subject's resources that the overlord can receive via",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "license_subject_master_purchase_cost",
        label: "Modifies the cost of licensed production from the overlord.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "master_build_autonomy_factor",
        label: "Modifies loss of autonomy from the overlord building in subject's states by a pe",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "master_ideology_drift",
        label: "Changes daily gain of the overlord's ideology in the country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "overlord_trade_cost_factor",
        label: "Modifies the cost of trade between the overlord and the subject in civilian fact",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "dockyard_donations",
        label: "Amount of dockyards donated.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "industrial_factory_donations",
        label: "Amount of civilian factories donated.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "military_factory_donations",
        label: "Amount of military factories donated.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "exile_manpower_factor",
        label: "Amount of manpower given to the host country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "exiled_government_weekly_manpower",
        label: "Amount of weekly manpower given to the host country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "legitimacy_daily",
        label: "Changes the amount of legitimacy gained daily.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "legitimacy_gain_factor",
        label: "Changes the amount of legitimacy gained daily by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "equipment_capture",
        label: "Changes the combat equipment capture ratio.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "equipment_capture_factor",
        label: "Modifies the combat equipment capture ratio.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "equipment_conversion_speed",
        label: "Changes the speed at which equipment is converted.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "equipment_upgrade_xp_cost",
        label: "Changes the experience cost to upgrade military equipment.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "license_purchase_cost",
        label: "Changes the cost of licensed equipment by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "license_purchase_cost_factor",
        label: "Changes the cost of licensed equipment by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "license_purchase_cost_factor",
        label: "Changes the cost of licensed equipment by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "license_tech_difference_speed",
        label: "Changes the production penalty of licensed equipment by tech difference by a per",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "license_production_speed",
        label: "Changes the production speed of licensed equipment by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "production_factory_efficiency_gain_factor",
        label: "Production efficiency growth.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "production_factory_max_efficiency_factor",
        label: "Production efficiency cap.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "production_factory_start_efficiency_factor",
        label: "Production efficiency base.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "line_change_production_efficiency_factor",
        label: "Production efficiency retention.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "production_lack_of_resource_penalty_factor",
        label: "Lack of resources penalty.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "floating_harbor_duration",
        label: "Modifies the duration of floating harbours.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "floating_harbor_range",
        label: "Modifies the range of floating harbours.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "floating_harbor_supply",
        label: "Modifies the supply of floating harbours.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "railway_gun_bombardment_factor",
        label: "Modifies the bombardment of railway guns.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "base_fuel_gain",
        label: "Changes base daily gain of fuel.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "base_fuel_gain_factor",
        label: "Changes base daily gain of fuel by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "fuel_cost",
        label: "Changes hourly cost of fuel.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "fuel_gain",
        label: "Changes daily gain of fuel from our controlled oil.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "fuel_gain_factor",
        label: "Changes daily gain of fuel from our controlled oil by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "fuel_gain_from_states",
        label: "Changes daily gain of fuel.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "fuel_gain_factor_from_states",
        label: "Changes daily gain of fuel by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "max_fuel",
        label: "Changes maximum amount of fuel you can have.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "max_fuel_factor",
        label: "Changes maximum amount of fuel you can have by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "army_fuel_capacity_factor",
        label: "Modifies how much fuel a single unit can store before running out.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_fuel_consumption_factor",
        label: "Modifies the rate at which the army consumes fuel.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_fuel_consumption_factor",
        label: "Modifies the rate at which the airforce consumes fuel.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_fuel_consumption_factor",
        label: "Modifies the rate at which the navy consumes fuel.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "supply_factor",
        label: "Modifies the total amount of supply the military has.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "supply_combat_penalties_on_core_factor",
        label: "Modifies the penalty given by low supply when the army is on a core state.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "supply_consumption_factor",
        label: "Modifies the rate at which army consumes supply.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "no_supply_grace",
        label: "Modifies the grace period for units without supply.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "out_of_supply_factor",
        label: "Reduces the penalty that units take when they run out of supplies.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "attrition",
        label: "Modifies the army's attrition.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "unit_upkeep_attrition_factor",
        label: "Modifies the unit upkeep.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_attrition",
        label: "Modifies attrition suffered by naval units.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "heat_attrition",
        label: "Changes the attrition due to heat.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "heat_attrition_factor",
        label: "Changes the attrition due to heat by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "winter_attrition",
        label: "Changes the attrition due to winter.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "winter_attrition_factor",
        label: "Changes the attrition due to winter by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "extra_marine_supply_grace",
        label: "Changes the supply grace given to marines.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "extra_paratrooper_supply_grace",
        label: "Changes the supply grace given to paratroopers.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "special_forces_no_supply_grace",
        label: "Changes the supply grace period for special forces.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "special_forces_out_of_supply_factor",
        label: "Changes the penalty for special forces out of supply.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "truck_attrition",
        label: "Changes the attrition supply trucks suffer from.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "truck_attrition_factor",
        label: "Modifies the attrition supply trucks suffer from.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "production_speed_buildings_factor",
        label: "Changes the construction speed of all buildings.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "civilian_factory_use",
        label: "Uses the specified amount of civilian factory as a special project.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "consumer_goods_factor",
        label: "Modifies the percentage of factories used for consumer goods.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "consumer_goods_expected_value",
        label: "Sets the baseline percentage of expected consumer goods.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "conversion_cost_civ_to_mil_factor",
        label: "Changes the cost to convert civilian factories to military factories.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "conversion_cost_mil_to_civ_factor",
        label: "Changes the cost to convert military factories to civilian factories.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "global_building_slots",
        label: "Changes amount of building slots in our every state.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "global_building_slots_factor",
        label: "Changes amount of building slots in our every state by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "industrial_capacity_dockyard",
        label: "Dockyard output.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "industrial_capacity_factory",
        label: "Military factory output.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "industry_air_damage_factor",
        label: "Amount of damage our factories receive from air bombings.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "industry_free_repair_factor",
        label: "Changes the speed at which buildings repair themselves without factories assigne",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "industry_repair_factor",
        label: "Changes the speed at which buildings are repaired.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "production_oil_factor",
        label: "Synthetic oil gain.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "supply_node_range",
        label: "Increases the effective range of supply nodes.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "static_anti_air_damage_factor",
        label: "Modifies the damage done to planes by the anti-air buildings.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "static_anti_air_hit_chance_factor",
        label: "Modifies the chance for the anti-air buildings to hit enemy planes.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "tech_air_damage_factor",
        label: "Modifies the damage done to the country's planes by enemy anti-air buildings.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "tech_air_damage_factor",
        label: "Modifies the damage done to the country's planes by enemy anti-air buildings.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "cic_construction_boost",
        label: "Modifies the base construction speed from civilian factories.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "cic_construction_boost_factor",
        label: "Modifies the modifier to the base construction speed from civilian factories.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "land_bunker_effectiveness_factor",
        label: "Modifies the effectiveness of land forts in defence.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "coastal_bunker_effectiveness_factor",
        label: "Modifies the effectiveness of coastal forts in defence.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "compliance_growth_on_our_occupied_states",
        label: "Changes the compliance growth speed on the country's controlled states.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "no_compliance_gain",
        label: "Disables the compliance gain on our controlled states.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "required_garrison_factor",
        label: "Changes the required garrison in our occupied states.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "resistance_activity",
        label: "Changes the chance for resistance activity to occur on our occupied states.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "resistance_damage_to_garrison_on_our_occupied_states",
        label: "Changes the resistance damage to the garrison in our occupied states.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "resistance_decay_on_our_occupied_states",
        label: "Changes the resistance decay in our occupied states.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "resistance_growth_on_our_occupied_states",
        label: "Changes the resistance growth speed in our occupied states.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "resistance_target_on_our_occupied_states",
        label: "Changes the resistance target in our occupied states.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "resistance_target",
        label: "Changes the resistance target in foreign states occupied by us",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "agency_upgrade_time",
        label: "Changes the time it takes to upgrade the agency",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "decryption",
        label: "Changes the decription capability of the country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "decryption_factor",
        label: "Changes the decription capability of the country by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "encryption",
        label: "Changes the encryption capability of the country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "encryption_factor",
        label: "Changes the encryption capability of the country by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "female_random_operative_chance",
        label: "Changes the chance for a randomly-generated operative to be female.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "foreign_subversive_activites",
        label: "Changes efficiency of foreign subversive activities.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "intel_network_gain",
        label: "Changes gain of intel network strength.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "intel_network_gain_factor",
        label: "Changes gain of intel network strength by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "subversive_activites_upkeep",
        label: "Changes the cost of subversive activities.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "operation_cost",
        label: "Changes the cost of operations.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "operation_outcome",
        label: "Changes the efficiency of operations.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "operation_risk",
        label: "Changes the risk of operations.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "commando_trait_chance_factor",
        label: "Modifies the chance for an operative to get the commando trait when hired.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "crypto_department_enabled",
        label: "Enables the crypto department.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "crypto_strength",
        label: "Modifies the cryptology level.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "decryption_power",
        label: "Modifies the decryption power.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "decryption_power_factor",
        label: "Modifies the decryption power by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "defense_impact_on_blueprint_stealing",
        label: "Modifies the impact of enemy defense on the blueprint stealing operation.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "intel_from_combat_factor",
        label: "Modifies the intelligence gained from combat.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "intel_from_operatives_factor",
        label: "Modifies the intelligence gained from operatives and infiltrated assets.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "intel_network_gain",
        label: "Modifies the intelligence network gain.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "intel_network_gain_factor",
        label: "Modifies the intelligence network gain by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "intelligence_agency_defense",
        label: "Modifies the counter intelligence.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "root_out_resistance_effectiveness_factor",
        label: "Modifies the effectiveness of rooting out resistance.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "own_operative_capture_chance_factor",
        label: "Changes the chance for our operatives to be captured.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "own_operative_detection_chance",
        label: "Changes the chance for our operatives to be detected.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "own_operative_detection_chance_factor",
        label: "Changes the chance for our operatives to be detected by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "own_operative_forced_into_hiding_time_factor",
        label: "Changes the chance for our operatives to be forced into hiding by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "own_operative_harmed_time_factor",
        label: "Changes the chance for our operatives to be harmed by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "own_operative_intel_extraction_rate",
        label: "Changes the rate at which our operatives extract enemy intel.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "enemy_operative_capture_chance_factor",
        label: "Changes the chance for an enemy operative to be captured.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "enemy_operative_detection_chance",
        label: "Changes the chance for an enemy operative to be detected.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "enemy_operative_detection_chance_factor",
        label: "Changes the chance for an enemy operative to be detected by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "enemy_operative_forced_into_hiding_time_factor",
        label: "Changes the chance for an enemy operative to be forced into hiding by a percenta",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "enemy_operative_harmed_time_factor",
        label: "Changes the chance for an enemy operative to be harmed by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "enemy_operative_intel_extraction_rate",
        label: "Changes the rate at which the enemy operatives extract our intel.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "enemy_spy_negative_status_factor",
        label: "Changes the chance an enemy spy can receive a negative status.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "enemy_operative_recruitment_chance",
        label: "Modifies the chance to recruit an enemy operative.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "new_operative_slot_bonus",
        label: "Modifies the operative recruitment choices.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "occupied_operative_recruitment_chance",
        label: "Modifies the chance to get an operative from occupied territory.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "operative_death_on_capture_chance",
        label: "Modifies the chance for the country's operative to die on being captured.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "operative_slot",
        label: "Modifies the amount of operative slots.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_badass_factor",
        label: "AI's threat perception.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_call_ally_desire_factor",
        label: "Chance for AI to call allies.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "ai_desired_divisions_factor",
        label: "The amount of divisions AI seeks to produce.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_focus_aggressive_factor",
        label: "AI's focus on offense.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_focus_defense_factor",
        label: "AI's focus on defense.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_focus_aviation_factor",
        label: "AI's focus on aviation.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_focus_military_advancements_factor",
        label: "AI's focus on advanced military technologies.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_focus_military_equipment_factor",
        label: "AI's focus on advanced military equipment.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_focus_naval_air_factor",
        label: "AI's focus on building naval airforce.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_focus_naval_factor",
        label: "AI's focus on building a navy.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_focus_peaceful_factor",
        label: "AI's focus on peaceful research and policies.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_focus_war_production_factor",
        label: "AI's focus on wartime production.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_get_ally_desire_factor",
        label: "AI's desire to be in or expand a faction.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_join_ally_desire_factor",
        label: "AI's desire to join the wars led by allies.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ai_license_acceptance",
        label: "AI's chance to agree licensing equipment.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "command_power_gain",
        label: "Changes the daily gain of command power.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "command_power_gain_mult",
        label: "Changes the daily gain of command power by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "conscription",
        label: "Changes the recruitable percentage of the total population.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "conscription_factor",
        label: "Changes the recruitable percentage of the total population by a percent.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "experience_gain_army",
        label: "Modifies the daily gain of army experience.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "experience_gain_army_factor",
        label: "Modifies the gain of army experience by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "experience_gain_navy",
        label: "Modifies the daily gain of naval experience.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "experience_gain_navy_factor",
        label: "Modifies the gain of naval experience by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "experience_gain_air",
        label: "Modifies the daily gain of air experience.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "experience_gain_air_factor",
        label: "Modifies the daily gain of air experience by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "land_equipment_upgrade_xp_cost",
        label: "Changes the experience cost to upgrade land army equipment.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "land_reinforce_rate",
        label: "Changes the rate at which reinforcements to divisions arrive.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "max_command_power",
        label: "Changes maximum command power.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "max_command_power_mult",
        label: "Changes maximum command power by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "weekly_manpower",
        label: "Amount of manpower gained each week.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_equipment_upgrade_xp_cost",
        label: "Changes the naval experience cost to upgrade equipment.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "refit_ic_cost",
        label: "The IC cost to refit naval equipment.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "refit_speed",
        label: "The speed at which naval equipment is refitted.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_equipment_upgrade_xp_cost",
        label: "Changes the air experience cost to upgrade equipment.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "training_time_factor",
        label: "Modifies the training time for both army and navy.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "minimum_training_level",
        label: "Changes training level necessary for the unit to deploy.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "max_training",
        label: "Modifies the required experience to achieve full training.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "training_time_army_factor",
        label: "Modifies the training time for the army.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "special_forces_training_time_factor",
        label: "Changes the time it takes to train special forces.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "choose_preferred_tactics_cost",
        label: "Changes the cost to choose a preferred tactic.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "command_abilities_cost_factor",
        label: "Changes the cost to choose a command ability.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "transport_capacity",
        label: "Modifies how many convoys units require to be transported over sea.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "paratroopers_special_forces_contribution_factor",
        label: "Modifies how much paratroopers contribute to the limit of special forces on a te",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "marines_special_forces_contribution_factor",
        label: "Modifies how much marines contribute to the limit of special forces on a templat",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "mountaineers_special_forces_contribution_factor",
        label: "Modifies how much mountaineers contribute to the limit of special forces on a te",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "rangers_special_forces_contribution_factor",
        label: "Modifies how much rangers contribute to the limit of special forces on a templat",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "special_forces_cap_flat",
        label: "Modifies how many special forces sub-units can be put into a single template.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "additional_brigade_column_size",
        label: "Changes the amount of maximum unlocked slots on each brigade column in division ",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "military_industrial_organization_research_bonus",
        label: "Modifies the research bonus granted by MIOs.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "military_industrial_organization_design_team_assign_cost",
        label: "Modifies the political power cost to assign a design team.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "military_industrial_organization_design_team_change_cost",
        label: "Modifies the political power cost to change a design team.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "military_industrial_organization_industrial_manufacturer_assign_cost",
        label: "Modifies the political power cost to assign an industrial manufacturer.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "military_industrial_organization_task_capacity",
        label: "Modifies the amount of tasks possible to assign to the MIO.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "military_industrial_organization_size_up_requirement",
        label: "Modifies the requirement to size up a MIO.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "military_industrial_organization_funds_gain",
        label: "Modifies the amount of funds gained by the MIO.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "military_industrial_organization_policy_cost",
        label: "Modifies the political power cost to assign a MIO policy.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "military_industrial_organization_policy_cooldown",
        label: "Modifies the cooldown between how often it's possible to change policies.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "female_random_army_leader_chance",
        label: "Changes the chance for a randomly-generated army leader to be female.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "assign_army_leader_cp_cost",
        label: "Modifies the cost to assign an army leader to an army.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_leader_cost_factor",
        label: "The cost in political power to recruit an unit leader for the land army.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_leader_start_level",
        label: "Bonus to the starting level of generic unit leaders.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_leader_start_attack_level",
        label: "Bonus to the starting level of attack in generic unit leaders.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_leader_start_defense_level",
        label: "Bonus to the starting level of defense in generic unit leaders.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_leader_start_logistics_level",
        label: "Bonus to the starting level of logistics in generic unit leaders.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_leader_start_planning_level",
        label: "Bonus to the starting level of planning in generic unit leaders.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "military_leader_cost_factor",
        label: "The cost in political power to recruit an unit leader.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "female_random_admiral_chance",
        label: "Changes the chance for a randomly-generated admiral to be female.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "assign_navy_leader_cp_cost",
        label: "Modifies the cost to assign a navy leader to a navy.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_leader_cost_factor",
        label: "The cost in political power to recruit an unit leader for the land navy.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_leader_start_level",
        label: "Bonus to the starting level of generic unit leaders.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_leader_start_attack_level",
        label: "Bonus to the starting level of attack in generic unit leaders.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_leader_start_coordination_level",
        label: "Bonus to the starting level of coordination in generic unit leaders.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_leader_start_defense_level",
        label: "Bonus to the starting level of defense in generic unit leaders.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_leader_start_maneuvering_level",
        label: "Bonus to the starting level of maneuvering in generic unit leaders.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "grant_medal_cost_factor",
        label: "Changes the cost in command power to grant a medal to a division commander.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "field_officer_promotion_penalty",
        label: "Changes the experience penalty applied to the divisions when a commander is prom",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "female_divisional_commander_chance",
        label: "Changes the chance to get a female divisional commander.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "offence",
        label: "Modifies the attack value of our military, navy, and airforce.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "defence",
        label: "Modifies the defence value of our military, navy, and airforce.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "acclimatization_cold_climate_gain_factor",
        label: "Cold acclimatization gain factor.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "acclimatization_hot_climate_gain_factor",
        label: "Hot acclimatization gain factor.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "air_superiority_bonus_in_combat",
        label: "The bonus in combat given from having air superiority.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_attack_factor",
        label: "The bonus to land army's attack.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_core_attack_factor",
        label: "The bonus to land army's attack on core territory.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_claim_attack_factor",
        label: "The bonus to land army's attack on claimed territory.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_attack_against_major_factor",
        label: "The bonus to land army's attack against a major country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_attack_against_minor_factor",
        label: "The bonus to land army's attack against a non-major country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_attack_speed_factor",
        label: "The bonus to speed at which the land army attacks.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_breakthrough_against_major_factor",
        label: "The bonus to land army's breakthrough against a major country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_breakthrough_against_minor_factor",
        label: "The bonus to land army's breakthrough against a non-major country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_defence_factor",
        label: "The bonus to land army's defence.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_defence_against_major_factor",
        label: "The bonus to land army's defence against a major country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_defence_against_minor_factor",
        label: "The bonus to land army's defence against a non-major country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_core_defence_factor",
        label: "The bonus to land army's defence on core territory.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_claim_defence_factor",
        label: "The bonus to land army's defence on claimed territory.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_speed_factor",
        label: "The bonus to land army's speed.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_strength_factor",
        label: "The bonus to land army's strength.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_morale",
        label: "Modifies the division recovery rate.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_morale_factor",
        label: "Modifies the division recovery rate by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "army_org",
        label: "Modifies the army's organisation.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_org_factor",
        label: "Modifies the army's organisation by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "army_org_regain",
        label: "Modifies the army's organisation regain speed by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "breakthrough_factor",
        label: "Modifies the army's breakthrough.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "cas_damage_reduction",
        label: "Reduces the damage dealt by close air support.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "combat_width_factor",
        label: "Changes our own combat width.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "coordination_bonus",
        label: "Changes the bonus to coordination, that is how much damage is done to the primar",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "dig_in_speed",
        label: "Changes entrenchment speed.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "dig_in_speed_factor",
        label: "Changes entrenchment speed by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "experience_gain_army_unit",
        label: "Changes experience gain by the army divisions.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "experience_gain_army_unit_factor",
        label: "Changes experience gain by the army divisions by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "experience_loss_factor",
        label: "Changes the loss in divisions' experience in combat.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "initiative_factor",
        label: "Modifies the initiative.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "land_night_attack",
        label: "Changes the penalty due to attacking at night.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "max_dig_in",
        label: "Changes the maximum entrenchment.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "max_dig_in_factor",
        label: "Changes the maximum entrenchment by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "max_planning",
        label: "Changes the maximum planning.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "max_planning_factor",
        label: "Changes the maximum planning by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "pocket_penalty",
        label: "Reduces the penalty that troops take when they are encircled.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "recon_factor",
        label: "Changes reconnaisance.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "recon_factor_while_entrenched",
        label: "Changes reconnaisance for entrenched divisions.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "special_forces_cap",
        label: "Changes the maximum amount of special forces by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "special_forces_min",
        label: "Changes the minimum amount of special forces.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "terrain_penalty_reduction",
        label: "Decreases the penalties given by terrain.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "org_loss_at_low_org_factor",
        label: "Modifies the organisation loss for units when they have low organisation.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "org_loss_when_moving",
        label: "Modifies the organisation loss for units when they are moving.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "planning_speed",
        label: "Modifies the planning speed.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_invasion_prep_speed",
        label: "Modifies the speed at which a naval invasion is prepared.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_invasion_capacity",
        label: "Modifies the amount of divisions that can have a naval invasion plan going on at",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_invasion_penalty",
        label: "Modifies the penalty for naval invasions.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_invasion_planning_bonus_speed",
        label: "Modifies the speed at which the planning bonus is accumulated during a naval inv",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "amphibious_invasion",
        label: "Modifies the speed of units during naval invasions.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "amphibious_invasion_defence",
        label: "Modifies the penalty given by naval invasions.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "invasion_preparation",
        label: "Modifies the required preparation needed to execute a naval invasion.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "convoy_escort_efficiency",
        label: "Modifies the efficiency of the convoy escort mission.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "convoy_raiding_efficiency_factor",
        label: "Modifies the efficiency of the convoy raiding mission.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "convoy_retreat_speed",
        label: "Modifies the speed of convoys retreating.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "critical_receive_chance",
        label: "Changes the chance for the enemy to get a critical hit on us in naval combat.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "experience_gain_navy_unit",
        label: "Modifies the daily gain of experience by the ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "experience_gain_navy_unit_factor",
        label: "Modifies the gain of experience by the ships by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "mines_planting_by_fleets_factor",
        label: "Modifies the efficiency of the mine planting mission.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "mines_sweeping_by_fleets_factor",
        label: "Modifies the efficiency of the mine sweeping mission.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_accidents_chance",
        label: "Modifies the chance for a ship to be accidentally sunk or damaged.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "navy_anti_air_attack",
        label: "Modifies the attack against enemy airplanes for the country's ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_anti_air_attack_factor",
        label: "Modifies the attack against enemy airplanes for the country's ships by a percent",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_coordination",
        label: "Modifies how quickly the fleet can gather or disperse when a target is found or ",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_critical_effect_factor",
        label: "Modifies the effects of sustained critical hits on our ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_critical_score_chance_factor",
        label: "Modifies the chance for us to get a critical hit on the enemy in naval combat.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_damage_factor",
        label: "Modifies the damage dealt by our ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_defense_factor",
        label: "Modifies the damage received by our ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_detection",
        label: "Modifies the chance for our ships to detect submarines.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_enemy_fleet_size_ratio_penalty_factor",
        label: "Modifies the penalty the enemy receives for having a larger amount of ships than",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_enemy_positioning_in_initial_attack",
        label: "Modifies the positioning of the enemy during the initial naval attack.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_enemy_retreat_chance",
        label: "Modifies the chance for the enemy to retreat.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_has_potf_in_combat_attack",
        label: "Modifies the attack of the navy when fighting together with the pride of the fle",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_has_potf_in_combat_defense",
        label: "Modifies the defense of the navy when fighting together with the pride of the fl",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_hit_chance",
        label: "Modifies the chance for the naval attacks to land.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_mine_hit_chance",
        label: "Modifies the chance for a naval mine to hit.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_mines_damage_factor",
        label: "Modifies the damage naval mines deal to enemy ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_mines_effect_reduction",
        label: "Modifies the damage enemy naval mines deal.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_morale",
        label: "Modifies the navy recovery rate.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_morale_factor",
        label: "Modifies the navy recovery rate by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_night_attack",
        label: "Modifies the damage dealt by the country's ships at night.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_retreat_chance",
        label: "Modifies the chance for the country's ships to retreat.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_retreat_chance_after_initial_combat",
        label: "Modifies the chance for the country's ships to retreat after initial combat.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_retreat_speed",
        label: "Modifies the speed at which the country's ships retreat.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_retreat_speed_after_initial_combat",
        label: "Modifies the speed at which the country's ships to retreat after initial combat.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_speed_factor",
        label: "Modifies the speed of the country's ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_org",
        label: "Modifies the navy's organisation.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_org_factor",
        label: "Modifies the navy's organisation by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "navy_max_range",
        label: "Modifies the navy's maximum range.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_max_range_factor",
        label: "Modifies the navy's maximum range by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_torpedo_cooldown_factor",
        label: "Modifies the rate at which the country's ships can fire torpedos.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_torpedo_hit_chance_factor",
        label: "Modifies the likelihood for country's torpedos to hit enemy ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_torpedo_reveal_chance_factor",
        label: "Modifies the chance that the country's submarines reveal themselves when firing ",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_torpedo_screen_penetration_factor",
        label: "Modifies the rate at which the country's torpedos penalise enemy screening.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_torpedo_damage_reduction_factor",
        label: "Modifies the damage at which enemy torpedos damage the country's ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "naval_torpedo_enemy_critical_chance_factor",
        label: "Modifies the chance for an enemy torpedo to get a cricical hit against the count",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_light_gun_hit_chance_factor",
        label: "Modifies the chance for the country's naval light guns to hit enemy ships.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_heavy_gun_hit_chance_factor",
        label: "Modifies the chance for the country's naval heavy guns to hit enemy ships.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "navy_capital_ship_attack_factor",
        label: "Modifies the attack of the country's capital ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_capital_ship_defence_factor",
        label: "Modifies the defence of the country's capital ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_screen_attack_factor",
        label: "Modifies the attack of the country's screening ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_screen_defence_factor",
        label: "Modifies the defence of the country's screening ships.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_submarine_attack_factor",
        label: "Modifies the attack of the country's submarines.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_submarine_defence_factor",
        label: "Modifies the defence of the country's submarines.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_submarine_detection_factor",
        label: "Modifies the country's detection of enemy submarines.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_visibility",
        label: "Modifies the visibility of the country's navy.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_weather_penalty",
        label: "Modifies the penalty the country's navy gets during poor weather.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "night_spotting_chance",
        label: "Modifies the chance for the country's navy to spot the enemy at night.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "positioning",
        label: "Modifies the positioning of the country's navy.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "repair_speed_factor",
        label: "Modifies the speed at which the dockyards repair the navy.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "screening_efficiency",
        label: "Modifies the efficiency screen ships operate.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "screening_without_screens",
        label: "Modifies the base screening without any screen ships assigned.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ships_at_battle_start",
        label: "Modifies the number of ships at first contact.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "spotting_chance",
        label: "Modifies the chance to spot enemy ships.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "strike_force_movement_org_loss",
        label: "Modifies the organisation loss from movement during the strike force mission.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "sub_retreat_speed",
        label: "Modifies the retreat speed of submarines.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "submarine_attack",
        label: "Modifies the attack of submarines.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_carrier_air_agility_factor",
        label: "Modifies the agility of airplanes executing tasks from carriers.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_carrier_air_attack_factor",
        label: "Modifies the attack of airplanes executing tasks from carriers.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_carrier_air_targetting_factor",
        label: "Modifies the targeting of airplanes executing tasks from carriers.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_carrier_night_penalty_reduction_factor",
        label: "Modifies the reduction of the night penalty for air carriers.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "carrier_capacity_penalty_reduction",
        label: "Modifies the penalty given by overcrowding a carrier with planes.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "carrier_traffic",
        label: "Modifies the traffic of carriers.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "sortie_efficiency",
        label: "Modifies the speed when refueling and rearming planes on the carrier during the ",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "carrier_sortie_hours_delay",
        label: "Modifies the delay in hours for refueling and rearming planes on the carrier.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "carrier_night_traffic",
        label: "Modifies the traffic of carriers at night.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "fighter_sortie_efficiency",
        label: "Modifies the speed when refueling and rearming fighter planes on the carrier dur",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_accidents_factor",
        label: "Modifies the chance for air accidents to happen.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "air_ace_bonuses_factor",
        label: "Modifies the bonuses the aces grant.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_ace_generation_chance_factor",
        label: "Modifies the chance for aces to appear.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "ace_effectiveness_factor",
        label: "Modifies the effectiveness of aces",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_agility_factor",
        label: "Modifies the agility of the country's airplanes.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_attack_factor",
        label: "Modifies the attack of the country's airplanes.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_defence_factor",
        label: "Modifies the defence of the country's airplanes.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_interception_detect_factor",
        label: "Modifies the chance of detecting an enemy plane while on interception mission.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_strike_targetting_factor",
        label: "Modifies the ability of planes to target their objectives when executing naval s",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "port_strike",
        label: "Modifies the damage done by planes on the port strike mission.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_close_air_support_org_damage_factor",
        label: "Modifies the damage to division organisation by planes on the close air support ",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_bombing_targetting",
        label: "Modifies targetting for ground bombing.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_cas_efficiency",
        label: "Modifies efficiency of close-air-support.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_cas_present_factor",
        label: "Modifies impact of close-air-support in land combat.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_escort_efficiency",
        label: "Modifies ability of planes in dogfights.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_home_defence_factor",
        label: "Modifies the defence of airplanes when defending states in the home region (Conn",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_intercept_efficiency",
        label: "Modifies the efficiency of air interception.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_manpower_requirement_factor",
        label: "Modifies the manpower required to deploy an airplane.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_maximum_speed_factor",
        label: "Modifies the maximum speed of the airforce.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_mission_efficiency",
        label: "Modifies the efficiency of airplanes in missions.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_mission_xp_gain_factor",
        label: "Modifies the experience gain for airplanes for doing missions.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_nav_efficiency",
        label: "Modifies the efficiency of airplanes doing port strike and naval bombing mission",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_night_penalty",
        label: "Modifies the penalty the airforce receives while at night.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_power_projection_factor",
        label: "Modifies the power projection given out by the airplanes.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_range_factor",
        label: "Modifies the range of the airplanes.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_strategic_bomber_bombing_factor",
        label: "Modifies the efficiency of the strategic bombing mission.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_strategic_bomber_night_penalty",
        label: "Modifies the penalty for the strategic bombing mission while at night.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_superiority_detect_factor",
        label: "Modifies the chance to detect enemy planes while on the air superiority mission.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "air_superiority_efficiency",
        label: "Modifies the efficiency of the air superiority mission.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_training_xp_gain_factor",
        label: "Modifies the air experience gain from training.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_untrained_pilots_penalty_factor",
        label: "Modifies the penalty given to airplanes which don't have enough experience.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_weather_penalty",
        label: "Modifies the penalty the airplanes receive because of weather.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_wing_xp_loss_when_killed_factor",
        label: "Modifies the experience loss of airplanes due to airplanes being shot down.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_bonus_air_superiority_factor",
        label: "Modifies the bonus to land combat from air superiority.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "enemy_army_bonus_air_superiority_factor",
        label: "Modifies the effect to land combat from enemy air superiority.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "ground_attack_factor",
        label: "Modifies the bonus to airplane attack on enemy divisions by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "mines_planting_by_air_factor",
        label: "Modifies efficiency of airplanes planting mines.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "mines_sweeping_by_air_factor",
        label: "Modifies efficiency of airplanes sweeping mines.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "strategic_bomb_visibility",
        label: "Modifies the chance for the enemy to detect our strategic bombers.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "rocket_attack_factor",
        label: "Modifies the attack given to rockets.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "extra_trade_to_target_factor",
        label: "Adds extra produced resources available for trade to target country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "generate_wargoal_tension_against",
        label: "Changes world tension necessary for us to justify against the target country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "cic_to_target_factor",
        label: "Gives a portion of the country's civilian industry to the specified target.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "mic_to_target_factor",
        label: "Gives a portion of the country's military industry to the specified target.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "trade_cost_for_target_factor",
        label: "The cost for the targeted country to purchase this country's resources.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "targeted_legitimacy_daily",
        label: "Changes daily gain of legitimacy of the target country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "attack_bonus_against",
        label: "Gives an attack bonus against the armies of the specified country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "attack_bonus_against_cores",
        label: "Gives an attack bonus against the armies of the specified country on its core te",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "breakthrough_bonus_against",
        label: "Gives a breakthrough bonus against the armies of the specified country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "defense_bonus_against",
        label: "Gives a defense bonus against the armies of the specified country.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "army_speed_factor_for_controller",
        label: "Changes the division speed for the controller of the state.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "attrition_for_controller",
        label: "Changes the attrition for the controller of the state.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "equipment_capture_for_controller",
        label: "Changes the equipment capture ratio by the state's controller.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "equipment_capture_factor_for_controller",
        label: "Modifies the equipment capture ratio by the state's controller.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "enemy_army_speed_factor",
        label: "Modifies the speed of divisions at war with the state's owner.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "enemy_local_supplies",
        label: "Modifies the supply of divisions at war with the state's owner.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "enemy_attrition",
        label: "Modifies the attrition of divisions at war with the state's owner.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "enemy_truck_attrition_factor",
        label: "Modifies the truck attrition of divisions at war with the state's owner.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "compliance_gain",
        label: "Changes the compliance gain in the current state.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "compliance_growth",
        label: "Changes the compliance growth speed in the current state.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "disable_strategic_redeployment",
        label: "Disables strategic redeployment in the state.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "disable_strategic_redeployment_for_controller",
        label: "Disables strategic redeployment in the state for the controller.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "enemy_intel_network_gain_factor_over_occupied_tag",
        label: "Modifies enemy intel network strength gain.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "local_building_slots",
        label: "Modifies amount of building slots.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "local_building_slots_factor",
        label: "Modifies amount of building slots by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "local_factories",
        label: "Modifies amount of available factories in the state.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "local_factory_energy_consumption",
        label: "Modifies amount of energy consumed by factories in the state.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "local_factory_energy_consumption_per_infrastructure",
        label: "Modifies amount of energy consumed by factories depending on the infrastructure ",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "local_factory_sabotage",
        label: "Modifies chance for factory sabotage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "local_intel_to_enemies",
        label: "Modifies amount of intel to enemies.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "local_manpower",
        label: "Modifies amount of available manpower.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "local_non_core_manpower",
        label: "Modifies amount of available non-core manpower.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "local_org_regain",
        label: "Modifies how much organisation is regained after combat.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "local_resource_gain_efficiency_per_infrastructure",
        label: "Modifies amount of available resources gained depending on the infrastructure of",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "local_resources",
        label: "Modifies amount of available resources.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "local_supplies",
        label: "Modifies amount of available supplies.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "local_supplies_for_controller",
        label: "Modifies amount of available supplies for the controller.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "local_supply_impact_factor",
        label: "Modifies the impact that the state's local supplies have.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "local_non_core_supply_impact_factor",
        label: "Modifies the impact that the state's local supplies have if the state is not cor",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "mobilization_speed",
        label: "Modifies the mobilisation speed.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "non_core_manpower",
        label: "Modifies the amount of recruited non-core manpower.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "max_fuel_building",
        label: "Modifies the amount of fuel capacity, in thousands, given to the state controlle",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "recruitable_population",
        label: "Modifies the amount of recruited manpower.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "recruitable_population_factor",
        label: "Modifies the amount of recruited manpower by a percentage.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "resistance_damage_to_garrison",
        label: "Modifies the amount of resistance damage to the garrison.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "resistance_decay",
        label: "Modifies the speed of resistance decay.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "resistance_garrison_penetration_chance",
        label: "Modifies the chance for the garrison to be penetrated.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "resistance_growth",
        label: "Modifies the speed of the resistance growth.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "resistance_target",
        label: "Modifies the target of the resistance growth.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "starting_compliance",
        label: "Modifies the base compliance value.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "state_bunker_max_level_terrain_limit",
        label: "Modifies the amount of available bunker building slots in the state.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "state_coastal_bunker_max_level_terrain_limit",
        label: "Modifies the amount of available coastal bunker building slots in the state.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "state_resources_factor",
        label: "Modifies the amount of resources in a state.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "enemy_operative_detection_chance_over_occupied_tag",
        label: "Offsets the chance for an enemy operative to be detected for the tag that occupi",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "enemy_operative_detection_chance_factor_over_occupied_tag",
        label: "Modifies the chance for an enemy operative to be detected for the tag that occup",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "cannot_use_abilities",
        label: "Disables using abilities.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "dont_lose_dig_in_on_attack",
        label: "Disables losing the entrechment bonus during attack.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "exiled_divisions_attack_factor",
        label: "Modifies the attack of divisions led by this unit leader if they're exiled.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "exiled_divisions_defense_factor",
        label: "Modifies the defence of divisions led by this unit leader if they're exiled.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "own_exiled_divisions_attack_factor",
        label: "Modifies the attack of divisions led by this unit leader if they're exiled and b",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "own_exiled_divisions_defense_factor",
        label: "Modifies the defence of divisions led by this unit leader if they're exiled and ",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "experience_gain_factor",
        label: "Modifies the experience gained by the unit leader.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "fortification_collateral_chance",
        label: "Chance for combat to damage enemy forts.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "fortification_damage",
        label: "Damage enemy forts receive from combat.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "max_commander_army_size",
        label: "Modifies amount of divisions that can be led by the army leader without penalty.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "max_army_group_size",
        label: "Modifies amount of army groups that can be led by the field marshal without pena",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "paradrop_organization_factor",
        label: "The amount of organisation paratroopers will have after paradropping.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "paratrooper_aa_defense",
        label: "The strength of anti-air against paratroopers.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "paratrooper_weight_factor",
        label: "Paratrooper transport space factor.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "promote_cost_factor",
        label: "The cost to promote the unit leader.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "reassignment_duration_factor",
        label: "The length of the reassignment penalty.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "river_crossing_factor",
        label: "The effects of the river crossing penalty.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "sickness_chance",
        label: "The chance for the unit leader to get sick.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "skill_bonus_factor",
        label: "The bonus the unit leader receives from their skillset.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "terrain_trait_xp_gain_factor",
        label: "Modifies the experience gain towards all terrain traits (With the type of either",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "wounded_chance_factor",
        label: "The chance for the unit leader to get wounded.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "shore_bombardment_bonus",
        label: "Modifies the penalty given by the shore bombardment on divisions.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "female_random_scientist_chance",
        label: "The chance of spawn female scientist",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "scientist_breakthrough_bonus_factor",
        label: "Modifiers scientist breakthrough bonus for special projects",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "scientist_research_bonus_factor",
        label: "Modifiers scientist research bonus for special projects",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "scientist_xp_gain_factor",
        label: "Modifiers scientist gain xp",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "air_accidents",
        label: "Base chance for an air accident to happen.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "air_detection",
        label: "Base chance for air detection.",
        params: [{"name": "value", "type": "float", "default": 0.1}],
    },
    {
        key: "naval_strike",
        label: "Base efficiency for naval strikes.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_casualty_on_sink",
        label: "Modifies the casualties when ships are sunk in this region.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
    {
        key: "navy_casualty_on_hit",
        label: "Modifies the casualties when ships are damaged in this region.",
        params: [{"name": "value", "type": "number", "default": 0}],
    },
];

const HOI4_SCOPES = [
    { key: "overlord", label: "Within country scope only" },
    { key: "faction_leader", label: "Within country scope only" },
    { key: "owner", label: "Within state, character, or combatant scope only" },
    { key: "controller", label: "Within state scope only" },
    { key: "capital_scope", label: "Within country scope only" },
    { key: "all_country", label: "Always usable" },
    { key: "any_country", label: "Always usable" },
    { key: "all_other_country", label: "Within country scope only" },
    { key: "any_other_country", label: "Within country scope only" },
    { key: "all_country_with_original_tag", label: "Always usable" },
    { key: "any_country_with_original_tag", label: "Always usable" },
    { key: "all_neighbor_country", label: "Within country scope only" },
    { key: "any_neighbor_country", label: "Within country scope only" },
    { key: "any_home_area_neighbor_country", label: "Within country scope only" },
    { key: "all_guaranteed_country", label: "Within country scope only" },
    { key: "any_guaranteed_country", label: "Within country scope only" },
    { key: "all_allied_country", label: "Within country scope only" },
    { key: "any_allied_country", label: "Within country scope only" },
    { key: "all_occupied_country", label: "Within country scope only" },
    { key: "any_occupied_country", label: "Within country scope only" },
    { key: "all_enemy_country", label: "Within country scope only" },
    { key: "any_enemy_country", label: "Within country scope only" },
    { key: "all_subject_countries", label: "Within country scope only" },
    { key: "any_subject_country", label: "Within country scope only" },
    { key: "any_country_with_core", label: "Within state scope only" },
    { key: "all_country_of", label: "Alway usable" },
    { key: "any_country_of", label: "Alway usable" },
    { key: "all_state", label: "Always usable" },
    { key: "any_state", label: "Always usable" },
    { key: "any_state_in", label: "Always usable" },
    { key: "any_state_of", label: "Alway usable" },
    { key: "all_neighbor_state", label: "Within state scope only" },
    { key: "any_neighbor_state", label: "Within state scope only" },
    { key: "all_owned_state", label: "Within country scope only" },
    { key: "any_owned_state", label: "Within country scope only" },
    { key: "all_core_state", label: "Within country scope only" },
    { key: "any_core_state", label: "Within country scope only" },
    { key: "all_controlled_state", label: "Within country scope only" },
    { key: "any_controlled_state", label: "Within country scope only" },
    { key: "all_unit_leader", label: "Within country scope only" },
    { key: "any_unit_leader", label: "Within country scope only" },
    { key: "all_army_leader", label: "Within country scope only" },
    { key: "any_army_leader", label: "Within country scope only" },
    { key: "all_navy_leader", label: "Within country scope only" },
    { key: "any_navy_leader", label: "Within country scope only" },
    { key: "all_operative_leader", label: "Within country scope or operations only" },
    { key: "any_operative_leader", label: "Within country scope or operations only" },
    { key: "all_character", label: "Within country scope only" },
    { key: "any_character", label: "Within country scope only" },
    { key: "any_country_division", label: "Within country scope only" },
    { key: "any_state_division", label: "Within state scope only" },
    { key: "all_military_industrial_organization", label: "Within country scope only" },
    { key: "any_military_industrial_organization", label: "Within country scope only" },
    { key: "all_purchase_contract", label: "Within country scope only" },
    { key: "any_purchase_contract", label: "Within country scope only" },
    { key: "all_scientists", label: "Within country scope only" },
    { key: "any_scientist", label: "Within country scope only" },
    { key: "all_active_scientist", label: "Within country scope only" },
    { key: "any_active_scientist", label: "Within country scope only" },
    { key: "every_possible_country", label: "Always usable" },
    { key: "every_country", label: "Always usable" },
    { key: "random_country", label: "Always usable" },
    { key: "every_other_country", label: "Within country scope only" },
    { key: "random_other_country", label: "Within country scope only" },
    { key: "every_country_with_original_tag", label: "Always usable" },
    { key: "random_country_with_original_tag", label: "Always usable" },
    { key: "every_neighbor_country", label: "Within country scope only" },
    { key: "random_neighbor_country", label: "Within country scope only" },
    { key: "every_occupied_country", label: "Within country scope only" },
    { key: "random_occupied_country", label: "Within country scope only" },
    { key: "every_allied_country", label: "Within country scope only" },
    { key: "random_allied_country", label: "Within country scope only" },
    { key: "every_enemy_country", label: "Within country scope only" },
    { key: "random_enemy_country", label: "Within country scope only" },
    { key: "every_subject_country", label: "Within country scope only" },
    { key: "random_subject_country", label: "Within country scope only" },
    { key: "every_faction_member", label: "Within country scope only" },
    { key: "every_state", label: "Always usable" },
    { key: "random_state", label: "Always usable" },
    { key: "every_neighbor_state", label: "Within state scope only" },
    { key: "random_neighbor_state", label: "Within state scope only" },
    { key: "every_owned_state", label: "Within country scope only" },
    { key: "random_owned_state", label: "Within country scope only" },
    { key: "every_core_state", label: "Within country scope only" },
    { key: "random_core_state", label: "Within country scope only" },
    { key: "every_controlled_state", label: "Within country scope only" },
    { key: "random_controlled_state", label: "Within country scope only" },
    { key: "random_owned_controlled_state", label: "Within country scope only" },
    { key: "every_unit_leader", label: "Within country scope only" },
    { key: "random_unit_leader", label: "Within country scope only" },
    { key: "every_army_leader", label: "Within country scope only" },
    { key: "random_army_leader", label: "Within country scope only" },
    { key: "global_every_army_leader", label: "Always usable" },
    { key: "every_navy_leader", label: "Within country scope only" },
    { key: "random_navy_leader", label: "Within country scope only" },
    { key: "every_operative", label: "Within country scope or operations only" },
    { key: "random_operative", label: "Within country scope or operations only" },
    { key: "every_character", label: "Within country scope only" },
    { key: "random_character", label: "Within country scope only" },
    { key: "every_country_division", label: "Within country scope only" },
    { key: "random_country_division", label: "Within country scope only" },
    { key: "every_state_division", label: "Within state scope only" },
    { key: "random_state_division", label: "Within state scope only" },
    { key: "every_military_industrial_organization", label: "Within country scope only" },
    { key: "random_military_industrial_organization", label: "Within country scope only" },
    { key: "every_purchase_contract", label: "Within country scope only" },
    { key: "random_purchase_contract", label: "Within country scope only" },
    { key: "every_scientist", label: "Within country scope only" },
    { key: "random_scientist", label: "Within country scope only" },
    { key: "every_active_scientist", label: "Within country scope only" },
    { key: "random_active_scientist", label: "Within country scope only" },
    { key: "party_leader", label: "Within country scope only" },
    { key: "every_collection_element", label: "Always usable" },
    { key: "start_civil_war", label: "ideology = <ideology> The ideology of the breakaway country. ruling_party = <ide" },
    { key: "create_dynamic_country", label: "original_tag = <tag> The original tag to be used by the country. copy_tag = <tag" },
    { key: "any_of_scopes", label: "Trigger" },
    { key: "all_of_scopes", label: "Trigger" },
    { key: "for_each_scope_loop", label: "Effect" },
    { key: "random_scope_in_array", label: "Effect" },
    { key: "count_triggers", label: "Within triggers" },
    { key: "hidden_trigger", label: "Within triggers" },
    { key: "custom_trigger_tooltip", label: "Within triggers" },
    { key: "custom_override_tooltip", label: "Within effects and triggers" },
    { key: "hidden_effect", label: "Within effects" },
    { key: "effect_tooltip", label: "Within effects" },
    { key: "for_loop_effect", label: "Within effects" },
    { key: "while_loop_effect", label: "Within effects" },
    { key: "random", label: "Within effects" },
    { key: "random_list", label: "Within effects" },
];

const HOI4_SCOPE_EFFECTS = [
    "all_active_scientist",
    "all_allied_country",
    "all_army_leader",
    "all_character",
    "all_controlled_state",
    "all_core_state",
    "all_country",
    "all_country_of",
    "all_country_with_original_tag",
    "all_enemy_country",
    "all_guaranteed_country",
    "all_military_industrial_organization",
    "all_navy_leader",
    "all_neighbor_country",
    "all_neighbor_state",
    "all_occupied_country",
    "all_of_scopes",
    "all_operative_leader",
    "all_other_country",
    "all_owned_state",
    "all_purchase_contract",
    "all_scientists",
    "all_state",
    "all_subject_countries",
    "all_unit_leader",
    "any_active_scientist",
    "any_allied_country",
    "any_army_leader",
    "any_character",
    "any_controlled_state",
    "any_core_state",
    "any_country",
    "any_country_division",
    "any_country_of",
    "any_country_with_core",
    "any_country_with_original_tag",
    "any_enemy_country",
    "any_guaranteed_country",
    "any_home_area_neighbor_country",
    "any_military_industrial_organization",
    "any_navy_leader",
    "any_neighbor_country",
    "any_neighbor_state",
    "any_occupied_country",
    "any_of_scopes",
    "any_operative_leader",
    "any_other_country",
    "any_owned_state",
    "any_purchase_contract",
    "any_scientist",
    "any_state",
    "any_state_division",
    "any_state_in",
    "any_state_of",
    "any_subject_country",
    "any_unit_leader",
    "every_active_scientist",
    "every_allied_country",
    "every_army_leader",
    "every_character",
    "every_collection_element",
    "every_controlled_state",
    "every_core_state",
    "every_country",
    "every_country_division",
    "every_country_with_original_tag",
    "every_enemy_country",
    "every_faction_member",
    "every_military_industrial_organization",
    "every_navy_leader",
    "every_neighbor_country",
    "every_neighbor_state",
    "every_occupied_country",
    "every_operative",
    "every_other_country",
    "every_owned_state",
    "every_possible_country",
    "every_purchase_contract",
    "every_scientist",
    "every_state",
    "every_state_division",
    "every_subject_country",
    "every_unit_leader",
    "random_active_scientist",
    "random_allied_country",
    "random_army_leader",
    "random_character",
    "random_controlled_state",
    "random_core_state",
    "random_country",
    "random_country_division",
    "random_country_with_original_tag",
    "random_enemy_country",
    "random_list",
    "random_military_industrial_organization",
    "random_navy_leader",
    "random_neighbor_country",
    "random_neighbor_state",
    "random_occupied_country",
    "random_operative",
    "random_other_country",
    "random_owned_controlled_state",
    "random_owned_state",
    "random_purchase_contract",
    "random_scientist",
    "random_scope_in_array",
    "random_state",
    "random_state_division",
    "random_subject_country",
    "random_unit_leader",
];

// ── 룩업 헬퍼 ───────────────────────────────────────────────
// 키로 단일 항목 조회
const HOI4_DEF_MAP = (() => {
    const m = {};
    for (const e of HOI4_EFFECTS)   m['e:' + e.key] = e;
    for (const t of HOI4_TRIGGERS)  m['t:' + t.key] = t;
    for (const mod of HOI4_MODIFIERS) m['m:' + mod.key] = mod;
    return m;
})();

function hoi4GetDef(key, kind) {
    // kind: 'effect' | 'trigger' | 'modifier' | null(전체 검색)
    if (kind === 'effect'   || !kind) { const d = HOI4_DEF_MAP['e:' + key]; if (d) return d; }
    if (kind === 'trigger'  || !kind) { const d = HOI4_DEF_MAP['t:' + key]; if (d) return d; }
    if (kind === 'modifier' || !kind) { const d = HOI4_DEF_MAP['m:' + key]; if (d) return d; }
    return null;
}

// 검색어로 목록 필터링 (최대 n개)
function hoi4SearchDefs(query, kinds = ['effect','trigger'], max = 40) {
    const q = query.toLowerCase();
    const results = [];
    const lists = {
        effect:   HOI4_EFFECTS,
        trigger:  HOI4_TRIGGERS,
        modifier: HOI4_MODIFIERS,
        scope:    HOI4_SCOPES,
    };
    for (const kind of kinds) {
        for (const item of (lists[kind] || [])) {
            if (results.length >= max) break;
            if (item.key.includes(q) || (item.label || '').toLowerCase().includes(q)) {
                results.push({ ...item, _kind: kind });
            }
        }
        if (results.length >= max) break;
    }
    return results;
}
