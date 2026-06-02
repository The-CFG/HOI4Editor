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
        params: [{"name": "target", "type": "country_tag"}, {"name": "transfer_troops", "type": "bool", "default": "yes"}],
    },
    {
        key: "set_autonomy",
        params: [{"name": "target", "type": "country_tag"}, {"name": "autonomy_state", "type": "string"}],
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
        params: [{"name": "ideology", "type": "ideology"}, {"name": "popularity", "type": "float", "default": 0.1}],
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
        label: "modifier = <modifier_string> The name of the Modifier. scope = <country> If you ",
        scope: "add_dynamic_modifier = { modifier = example_dynamic_modifier scope = GER days = 14 }",
    },
    {
        key: "remove_dynamic_modifier",
        label: "modifier = <modifier_string> The name of the Modifier.",
        scope: "remove_dynamic_modifier = { modifier = sabotaged_ressources }",
    },
    {
        key: "force_update_dynamic_modifier",
        label: "<bool> Boolean.",
        scope: "force_update_dynamic_modifier = yes",
    },
    {
        key: "add_state_resistance_compliance_modifier",
        label: "modifier = <resistance_compliance_modifier> Modifier to apply. state= <state> Af",
        scope: "add_state_resistance_compliance_modifier = { modifier = dynamic_modifier_name state = 738 }",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "remove_state_resistance_compliance_modifier",
        label: "modifier = <resistance_compliance_modifier> Modifier to remove. state= <state> A",
        scope: "remove_state_resistance_compliance_modifier = { modifier = dynamic_modifier_name state = 738 }",
        params: [{"name": "value", "type": "bool", "default": "yes"}],
    },
    {
        key: "play_song",
        label: "<song title from .asset> A music file located in the music folder and .asset",
        scope: "play_song = \"general_peace_1\"",
    },
    {
        key: "modify_global_flag",
        label: "flag = <flag> The flag to modify. value = <value> The value to add to the flag. ",
        scope: "modify_global_flag = { flag = my_flag value = 3 }",
    },
    {
        key: "save_event_target_as",
        label: "<string> An unique string to identify the event target with.",
        scope: "capital_scope = { save_event_target_as = my_state }",
    },
    {
        key: "save_global_event_target_as",
        label: "<string> An unique string to identify the global event target with.",
        scope: "random_other_country = { save_global_event_target_as = my_country }",
    },
    {
        key: "clear_global_event_target",
        label: "<string> The unique string of the global event target to clear.",
        scope: "clear_global_event_target = my_country",
    },
    {
        key: "clear_global_event_targets",
        label: "yes Boolean.",
        scope: "clear_global_event_targets = yes",
    },
    {
        key: "sound_effect",
        label: "<string> A sound reference from an .asset file.",
        scope: "sound_effect = \"boom\"",
    },
    {
        key: "randomize_weather",
        label: "<int> A seed integer.",
        scope: "randomize_weather = 12345",
    },
    {
        key: "set_province_name",
        label: "id = <id> The id of the province to be changed. name = <string> The name to chan",
        scope: "set_province_name = { id = 325 name = LOC_KEY } set_province_name = { id = 325 name = \"New Name\" }",
    },
    {
        key: "reset_province_name",
        label: "<id> The id of the province to reset.",
        scope: "reset_province_name = 325",
    },
    {
        key: "damage_units",
        label: "province = <id> Province where to damage units. state = <id> State where to dama",
        scope: "damage_units = { province = 42 state = 5 region = 5 limit = { has_country_flag = TAG_test } damage = 0.5 org_damage = 0.5 str_damage = 0.5 ratio = yes template = \"template_name\" army = no navy = yes }",
    },
    {
        key: "create_entity",
        label: "entity = <gfx_entry> The entity to spawn, defined within /Hearts of Iron IV/gfx/",
        scope: "create_entity = { entity = entity_name id = 123 var = var_name x = 42 y = 21 z = 3 province = 123 state = 42 rotation = 1.2 scale = 10.0 min_zoom = 100.0 visible = scripted_trigger_name }",
    },
    {
        key: "destroy_entity",
        label: "<id> The ID of the entity to destroy.",
        scope: "destroy_entity = 123",
    },
    {
        key: "set_entity_movement",
        label: "id = <ID> The ID of the entity to modify. ratio = <int> Distance between startin",
        scope: "set_entity_movement = { id = 123 start = { x = 42 y = 21 z = 3 } target = { province = 124 } ratio = 0.5 rotation = 1.2 }",
    },
    {
        key: "set_entity_position",
        label: "id = <id> x = <int> y = <int> z = <int> province = <int> state = <int>",
        scope: "set_entity_position = { id = 123 x = 42 y = 21 z = 3 province = 123 state = 42 }",
    },
    {
        key: "set_entity_rotation",
        label: "id = <ID> The ID of the entity to modify. rotation = <decimal> The new angle in ",
        scope: "set_entity_rotation = { id = 123 rotation = 0.23 }",
    },
    {
        key: "set_entity_scale",
        label: "id = <ID> The ID of the entity to modify. scale = <decimal> The scale to change ",
        scope: "set_entity_scale = { id = 123 scale = 5.0 }",
    },
    {
        key: "set_entity_animation",
        label: "id = <int> The ID of the entity to modify. animation = <animation_type> The anim",
        scope: "set_entity_animation = { id = 123 animation = \"shoot_lasers\" }",
    },
    {
        key: "build_railway",
        label: "level = <int> Defaults to 1 build_only_on_allied = <bool> No by default, if yes ",
        scope: "build_railway = { level = 1 build_only_on_allied = yes controller_priority = { base = 1 modifier = { tag = MAN add = 2 } } fallback = yes path = { 42 10 20 30 40 84 } start_province = 42 target_province = 84 } build_railway = { level = 1 build_only_on_allied = yes controller_priority = { base = 1 modifier = { tag = MAN add = 2 } } fallback = yes path = { 50 10 20 30 40 100 } start_state = 50 target_state = 100 }",
    },
    {
        key: "event_option_tooltip",
        label: "<option> The name of the option.",
        scope: "event_option_tooltip = mtg_usa_civil_war_fascists.1.a",
    },
    {
        key: "create_purchase_contract",
        label: "seller = <country> The seller in the contract. buyer = <country> The buyer in th",
        scope: "create_purchase_contract = { seller = ROOT buyer = FROM civilian_factories = 2 equipment = { type = artillery_equipment amount = 300 } }",
    },
    {
        key: "start_border_war",
        label: "change_state_after_war = <bool> Whether the state changes hands after the war. A",
        scope: "start_border_war = { change_state_after_war = no attacker = { state = 527 num_provinces = 4 on_win = japan_border_conflict.2 on_lose = japan_border_conflict.3 on_cancel = japan_border_conflict.4 modifier = 0.1 dig_in_factor = 0 terrain_factor = 0 } defender = { state = 408 num_provinces = 4 on_win = japan_border_conflict.3 on_lose = japan_border_conflict.2 on_cancel = japan_border_conflict.4 } }",
    },
    {
        key: "set_border_war_data",
        label: "attacker = <id> / <variable> The attacker state. defender = <id> / <variable> Th",
        scope: "set_border_war_data = { attacker = 527 defender = 408 defender_modifier = 0.15 combat_width = 100 }",
    },
    {
        key: "cancel_border_war",
        label: "attacker = <id> / <variable> The attacker state. defender = <id> / <variable> Th",
        scope: "cancel_border_war = { dont_fire_events = yes defender = 408 attacker = 527 }",
    },
    {
        key: "finalize_border_war",
        label: "attacker = <id> / <variable> The attacker state. defender = <id> / <variable> Th",
        scope: "finalize_border_war = { attacker_win = yes attacker = 527 defender = 408 }",
    },
    {
        key: "set_variable",
        label: "var = <variable> The variable to modify or create. value = <decimal>/<variable> ",
        scope: "set_variable = { var = my_variable value = 100 tooltip = set_var_to_100_tt } set_temp_variable = { temp_var = ROOT.overlord }",
    },
    {
        key: "set_variable_to_random",
        label: "var = <variable> The variable to modify or create. min = <decimal> The minimum p",
        scope: "set_variable_to_random = { var = random_num max = 11 integer = yes } set_temp_variable_to_random = my_var",
    },
    {
        key: "clear_variable",
        label: "<variable> Variable to clear.",
        scope: "clear_variable = my_variable",
    },
    {
        key: "add_to_variable",
        label: "var = <variable> The variable to add to. value = <decimal>/<variable> The value ",
        scope: "add_to_variable = { var = my_variable value = 100 tooltip = add_100_to_var_tt } add_to_temp_variable = { temp_var = num_owned_states }",
    },
    {
        key: "subtract_from_variable",
        label: "var = <variable> The variable to subtract from. value = <decimal>/<variable> The",
        scope: "subtract_from_variable = { var = my_variable value = 100 tooltip = sub_100_from_var_tt } subtract_from_temp_variable = { temp_var = num_owned_states }",
    },
    {
        key: "multiply_variable",
        label: "var = <variable> The variable to multiply. value = <decimal>/<variable> The valu",
        scope: "multiply_variable = { var = my_variable value = 100 tooltip = multiply_var_by_100_tt } multiply_temp_variable = { temp_var = num_owned_states }",
    },
    {
        key: "divide_variable",
        label: "var = <variable> The variable to divide. value = <decimal>/<variable> The value ",
        scope: "divide_variable = { var = my_variable value = 100 tooltip = divide_var_by_100_tt } divide_temp_variable = { temp_var = num_owned_states }",
    },
    {
        key: "modulo_variable",
        label: "var = <variable> The variable to modulo. value = <decimal>/<variable> The value ",
        scope: "modulo_variable = { var = my_variable value = 50 tooltip = get_modulo_of_var_by_50_tt } modulo_temp_variable = { temp_var = num_controlled_states }",
    },
    {
        key: "round_variable",
        label: "<variable> The variable to round.",
        scope: "round_variable = my_variable round_temp_variable = temp",
    },
    {
        key: "clamp_variable",
        label: "var = <variable> The variable to clamp. min = <decimal>/<variable> The minimum v",
        scope: "clamp_variable = { var = my_var min = 0 } clamp_temp_variable = { var = my_var min = 0 }",
    },
    {
        key: "career_profile_set_temp_playthrough_variable",
        label: "var = <variable> The variable to modify or create. value = <decimal>/<variable> ",
        scope: "career_profile_set_temp_playthrough_variable = { sum = rocket_sites_built_1936 }",
    },
    {
        key: "career_profile_set_temp_variable",
        label: "var = <variable> The variable to modify or create. value = <decimal>/<variable> ",
        scope: "career_profile_set_temp_variable = { var = num_dogs value = num_dogs_in_career_profile }",
    },
    {
        key: "add_to_array",
        label: "array = <array> The array to modify. value = <decimal>/<variable> The variable t",
        scope: "add_to_array = { array = global.my_countries value = THIS.id } add_to_temp_array = { temp_states = THIS }",
    },
    {
        key: "remove_from_array",
        label: "array = <array> The array to modify. value = <decimal>/<variable> The variable t",
        scope: "remove_from_array = { array = global.my_countries index = 0 } remove_from_temp_array = { temp_states = THIS }",
    },
    {
        key: "clear_array",
        label: "<array> The array to clear.",
        scope: "clear_array = global.my_countries clear_temp_array = temp_states",
    },
    {
        key: "resize_array",
        label: "array = <array> The array to modify. value = <decimal>/<variable> The variable t",
        scope: "resize_array = { array = global.countries_by_states value = 10 size = global.countries^num } resize_temp_array = { temp_states = 20 }",
    },
    {
        key: "find_highest_in_array",
        label: "array = <array> The array to modify. value = <variable> The temporary variable w",
        scope: "find_highest_in_array = { array = global.countries_by_states value = temp_largest_country index = temp_country_index }",
    },
    {
        key: "find_lowest_in_array",
        label: "array = <array> The array to modify. value = <variable> The temporary variable w",
        scope: "find_lowest_in_array = { array = global.countries_by_states value = temp_largest_country index = temp_country_index }",
    },
    {
        key: "set_cosmetic_tag",
        label: "<string> The cosmetic tag to switch to.",
        scope: "set_cosmetic_tag = SAF_SOV_communism",
    },
    {
        key: "drop_cosmetic_tag",
        label: "<bool> Boolean.",
        scope: "drop_cosmetic_tag = yes",
    },
    {
        key: "set_rule",
        label: "<rule> Boolean. desc = <localisation key> The localisation used as the descripti",
        scope: "set_rule = { desc = TAG_my_rule_description can_create_factions = yes }",
    },
    {
        key: "can_access_market",
        label: "Can access International Market ( Puppets and Overlords can always access each o",
    },
    {
        key: "can_be_spymaster",
        label: "Can be Spy Master",
    },
    {
        key: "can_boost_other_ideologies",
        label: "Can boost popularity of other ideologies",
    },
    {
        key: "can_boost_own_ideology",
        label: "Can boost own party popularity in other countries",
    },
    {
        key: "can_create_collaboration_government",
        label: "Can create collaboration governments",
    },
    {
        key: "can_create_factions",
        label: "Can Create Factions",
    },
    {
        key: "can_declare_war_on_same_ideology",
        label: "Can declare war on country with the same ideology group without a war goal",
    },
    {
        key: "can_declare_war_without_wargoal_when_in_war",
        label: "Can declare war on a neighbor without a wargoal when at war with a major",
    },
    {
        key: "can_decline_call_to_war",
        label: "Can decline call to war",
    },
    {
        key: "can_force_government",
        label: "Can force government of another country to adopt the same ideology",
    },
    {
        key: "can_generate_female_aces",
        label: "Women in your country are allowed to become military pilots",
    },
    {
        key: "can_generate_female_country_leaders",
        label: "Can generate female country leaders",
    },
    {
        key: "can_generate_female_unit_leaders",
        label: "Can generate female unit leaders",
    },
    {
        key: "can_guarantee_other_ideologies",
        label: "Can guarantee other ideologies",
    },
    {
        key: "can_join_factions",
        label: "Can join factions",
    },
    {
        key: "can_join_factions_not_allowed_diplomacy",
        label: "Country's name is not allowed to join factions",
    },
    {
        key: "can_join_opposite_factions",
        label: "Can Join Factions led by another Ideology",
    },
    {
        key: "can_lower_tension",
        label: "Lowers World Tension with Guarantees",
    },
    {
        key: "can_not_build_buildings",
        label: "CAN_NOT_BUILD_BUILDINGS",
        scope: "Doesn't seem to work.",
    },
    {
        key: "can_not_declare_war",
        label: "Can not declare wars",
        scope: "Prevents generating wargoals, but not using existing ones.",
    },
    {
        key: "can_occupy_non_war",
        label: "Can hold territory owned by a country they are not at war with",
    },
    {
        key: "can_only_justify_war_on_threat_country",
        label: "Can justify war goals against a country that have not generated world tension",
    },
    {
        key: "can_puppet",
        label: "Can puppet a country",
    },
    {
        key: "can_send_volunteers",
        label: "Can send volunteer forces",
    },
    {
        key: "can_use_kamikaze_pilots",
        label: "Can use kamikaze pilots",
    },
    {
        key: "contributes_operatives",
        label: "Contributes Operatives to Spy Master: Yes",
        scope: "Only has an effect for subjects.",
    },
    {
        key: "units_deployed_to_overlord",
        label: "Control over deployed units go to overlord",
        scope: "Only has an effect for subjects.",
    },
    {
        key: "set_party_rule",
        label: "ideology = <ideology group> Ideology group of the party. desc = <localisation ke",
        scope: "set_party_rule = { ideology = democratic desc = TAG_my_rule_description can_create_factions = yes }",
    },
    {
        key: "add_relation_rule_override",
        label: "target = <country> Target of the rule. usage_desc = <localisation key> A descrip",
        scope: "add_relation_rule_override = { target = SOV usage_desc = TAG_my_rule_description trigger = my_scripted_trigger can_access_market = yes }",
    },
    {
        key: "remove_relation_rule_override",
        label: "target = <country> Target of the rule. usage_desc = <localisation key> A descrip",
        scope: "remove_relation_rule_override = { target = SOV usage_desc = TAG_my_rule_description can_access_market = yes }",
    },
    {
        key: "scoped_sound_effect",
        label: "<string> A sound reference from an .asset file.",
        scope: "scoped_sound_effect = \"boom\"",
    },
    {
        key: "scoped_play_song",
        label: "<song title from .asset> A music file located in the music folder and .asset",
        scope: "scoped_play_song = \"general_peace_1\"",
    },
    {
        key: "goto_province",
        label: "<id> The id of the province go to.",
        scope: "goto_province = 325",
    },
    {
        key: "goto_state",
        label: "<state> / <variable> The id of the state go to.",
        scope: "goto_state = 1 goto_state = var:some_state",
    },
    {
        key: "change_tag_from",
        label: "<country> / <variable> The country to change from.",
        scope: "change_tag_from = ROOT change_tag_from = var:from.country",
    },
    {
        key: "reserve_dynamic_country",
        label: "<bool>",
        scope: "reserve_dynamic_country = yes",
    },
    {
        key: "force_update_map_mode",
        label: "limit = { ... } Triggers required for the map mode to refresh. Optional. mapmode",
        scope: "force_update_map_mode = { limit = { is_ai = no } mapmode = my_map_mode }",
    },
    {
        key: "add_ai_strategy",
        label: "type = <type> The type of strategy. id = <country> What country the strategy is ",
        scope: "add_ai_strategy = { type = alliance id = GER value = 200 }",
    },
    {
        key: "add_state_claim",
        label: "<state> / <variable> The state to add a claim to.",
        scope: "add_state_claim = 345",
    },
    {
        key: "remove_state_claim",
        label: "<state> / <variable> The state to remove the claim from.",
        scope: "remove_state_claim = 345",
    },
    {
        key: "set_state_controller",
        label: "<state> / <variable> The state to change controller of.",
        scope: "set_state_controller = 345",
    },
    {
        key: "add_contested_owner",
        label: "<state> / <variable> State to contest.",
        scope: "add_contested_owner = 42",
    },
    {
        key: "remove_contested_owner",
        label: "<state> / <variable> State to stop contest.",
        scope: "remove_contested_owner = 42",
    },
    {
        key: "set_province_controller",
        label: "<id> The province to change controller of.",
        scope: "set_province_controller = 2999",
    },
    {
        key: "set_political_power",
        label: "<int> / <variable> The amount to add.",
        scope: "set_political_power = 100",
    },
    {
        key: "add_command_power",
        label: "<int> / <variable> The amount to add.",
        scope: "add_command_power = 100",
    },
    {
        key: "army_experience",
        label: "<float> / <variable> The amount to add.",
        scope: "army_experience = 10",
    },
    {
        key: "navy_experience",
        label: "<float> / <variable> The amount to add.",
        scope: "navy_experience = 10",
    },
    {
        key: "air_experience",
        label: "<float> / <variable> The amount to add.",
        scope: "air_experience = 10",
    },
    {
        key: "set_popularities",
        label: "<ideology> = <int>/<variable> The popularity to set.",
        scope: "set_popularities = { democratic = 50 neutrality = 15 fascism = 30 communism = 5 }",
    },
    {
        key: "set_political_party",
        label: "ideology = <ideology> The party to change. popularity = <int> The amount of popu",
        scope: "set_political_party = { ideology = fascism popularity = 50 }",
    },
    {
        key: "set_party_name",
        label: "ideology = <ideology> The party to change. long_name = <string> The new full nam",
        scope: "set_party_name = { ideology = neutrality long_name = GER_neutrality_party_kaiserreich_long name = GER_neutrality_party_kaiserreich }",
    },
    {
        key: "hold_election",
        label: "<country> The country to hold an election for.",
        scope: "hold_election = ROOT",
    },
    {
        key: "set_power_balance",
        label: "id = <BoP ID> Balance of power to set/modify. left_side = <BoP side ID> The left",
        scope: "set_power_balance = { id = my_bop left_side = my_bop_left_side right_side = my_bop_right_side }",
    },
    {
        key: "remove_power_balance",
        label: "id = <BoP ID> Balance of power to modify.",
        scope: "remove_power_balance = { id = my_bop }",
    },
    {
        key: "add_power_balance_value",
        label: "id = <BoP ID> Balance of power to modify. value = <decimal> The value to add. to",
        scope: "add_power_balance_value = { id = my_bop value = -0.1 tooltip_side = my_bop_side }",
    },
    {
        key: "add_power_balance_modifier",
        label: "id = <BoP ID> Balance of power to modify. modifier = <static modifier> The stati",
        scope: "add_power_balance_modifier = { id = my_bop modifier = my_static_modifier }",
    },
    {
        key: "remove_power_balance_modifier",
        label: "id = <BoP ID> Balance of power to modify. modifier = <static modifier> The stati",
        scope: "remove_power_balance_modifier = { id = my_bop modifier = my_static_modifier }",
    },
    {
        key: "remove_all_power_balance_modifiers",
        label: "id = <BoP ID> Balance of power to modify.",
        scope: "remove_all_power_balance_modifiers = { id = my_bop }",
    },
    {
        key: "set_power_balance_gfx",
        label: "id = <BoP ID> Balance of power to modify. side = <BoP side ID> The side whose GF",
        scope: "set_power_balance_gfx = { id = my_bop side = my_bop_side gfx = GFX_my_bop_side_new }",
    },
    {
        key: "set_major",
        label: "<bool> Boolean.",
        scope: "set_major = yes",
    },
    {
        key: "release",
        label: "<country> The target country.",
        scope: "release = GER",
    },
    {
        key: "release_on_controlled",
        label: "<country> The target country.",
        scope: "release_on_controlled = GER",
    },
    {
        key: "release_puppet",
        label: "<country> The target country.",
        scope: "release_puppet = GER",
    },
    {
        key: "release_puppet_on_controlled",
        label: "<country> The target country.",
        scope: "release_puppet_on_controlled = GER",
    },
    {
        key: "release_autonomy",
        label: "target = <country> / <variable> The subject country. autonomy_state = <type> The",
        scope: "release_autonomy = { target = VIN autonomy_state = autonomy_puppet freedom_level = 0.5 }",
    },
    {
        key: "recall_attache",
        label: "<country> The target country with an attache.",
        scope: "recall_attache = GER",
    },
    {
        key: "reverse_add_opinion_modifier",
        label: "target = <country> The target country. modifier = <modifier> The opinion modifie",
        scope: "reverse_add_opinion_modifier = { target = GER modifier = faction_traitor }",
    },
    {
        key: "add_relation_modifier",
        label: "target = <country> The target country. modifier = <modifier> The relation modifi",
        scope: "add_relation_modifier = { target = SWE modifier = HUN_dynastic_ties_license }",
    },
    {
        key: "remove_relation_modifier",
        label: "target = <country> The target country. modifier = <modifier> The relation modifi",
        scope: "remove_relation_modifier = { target = SWE modifier = HUN_dynastic_ties_license }",
    },
    {
        key: "add_collaboration",
        label: "target = <country> The target country. value = <0-1> How much collaboration to a",
        scope: "add_collaboration = { target = TAG value = 0.3 }",
    },
    {
        key: "set_collaboration",
        label: "target = <country> The target country. value = <0-1> How much collaboration will",
        scope: "set_collaboration = { target = TAG value = 0.3 }",
    },
    {
        key: "recall_volunteers_from",
        label: "<tag> The target country.",
        scope: "recall_volunteers_from = SPR",
    },
    {
        key: "set_occupation_law",
        label: "<law ID> The new occupation law enacted by the previous scope or default_law .",
        scope: "USA = { GER = { set_occupation_law = foreign_civilian_oversight } } # Changes USA's occupation law for GER. USA = { USA = { set_occupation_law = default_law } } # Changes the USA's default occupation law to the default.",
    },
    {
        key: "set_occupation_law_where_available",
        label: "<law ID> The new occupation law enacted by the previous scope or default_law .",
        scope: "USA = { GER = { set_occupation_law_where_available = foreign_civilian_oversight } } # Changes USA's occupation law for GER where possible. USA = { USA = { set_occupation_law_where_available = default_law } } # Changes the USA's default occupation law to the default where possible.",
    },
    {
        key: "send_embargo",
        label: "<tag> The target country.",
        scope: "send_embargo = ITA",
    },
    {
        key: "break_embargo",
        label: "<tag> The target country.",
        scope: "break_embargo = ITA",
    },
    {
        key: "give_market_access",
        label: "<tag> The target country.",
        scope: "give_market_access = ITA",
    },
    {
        key: "create_faction_from_template",
        label: "<string> Faction template id. OR template = <string> The template of the faction",
        scope: "create_faction_from_template = faction_template_GER_mitteleuropa_alliance create_faction_from_template = { template = faction_template_defensive_democratic name = AUS_alpine_federation icon = GFX_faction_logo_generic_2 color = { 100 100 150 } }",
    },
    {
        key: "leave_faction",
        label: "<bool> Boolean.",
        scope: "leave_faction = yes",
    },
    {
        key: "set_faction_name",
        label: "Sets a faction name as the loc name.",
        scope: "set_faction_name = SOME_LOC_KEY",
    },
    {
        key: "set_faction_leader",
        label: "<bool> Boolean.",
        scope: "set_faction_leader = yes",
    },
    {
        key: "set_faction_spymaster",
        label: "<bool> Boolean.",
        scope: "set_faction_spymaster = yes",
    },
    {
        key: "set_faction_rule",
        label: "<string> Faction rule id.",
        scope: "set_faction_rule = rule_id",
    },
    {
        key: "set_faction_manifest",
        label: "<string> Faction manifest id.",
        scope: "set_faction_manifest = faction_manifest_id",
    },
    {
        key: "add_faction_goal",
        label: "<string> The goal of the faction.",
        scope: "add_faction_goal = faction_goal_an_armored_fist",
    },
    {
        key: "remove_faction_goal",
        label: "<string> The goal of the faction.",
        scope: "remove_faction_goal = faction_goal_secure_the_oil_supply",
    },
    {
        key: "add_faction_goal_slot",
        label: "category = <string> The category of the faction goal. value = <int> / <variable>",
        scope: "add_faction_goal_slot = { category = short_term value = 1 }",
    },
    {
        key: "add_faction_influence_ratio",
        label: "<float> / <variable> The amount to add.",
        scope: "add_faction_influence_ratio = 0.075",
    },
    {
        key: "add_faction_influence_score",
        label: "<int> / <variable> The amount to add.",
        scope: "add_faction_influence_score = 5",
    },
    {
        key: "add_faction_initiative",
        label: "<int> / <variable> The amount to add.",
        scope: "add_faction_initiative = 1",
    },
    {
        key: "add_faction_power_projection",
        label: "<int> / <variable> The amount to add.",
        scope: "add_faction_power_projection = 100",
    },
    {
        key: "set_faction_upgrade",
        label: "<string> Faction upgrade id.",
        scope: "set_faction_upgrade = token",
    },
    {
        key: "set_faction_member_upgrade_min",
        label: "upgrade = <string> Faction upgrade id.",
        scope: "set_faction_member_upgrade_min = { upgrade = TOKEN_TO_FACTION_MEMBER_UPGRADE }",
    },
    {
        key: "set_faction_military_unlocked",
        label: "<bool> Boolean.",
        scope: "set_faction_military_unlocked = yes",
    },
    {
        key: "set_faction_research_unlocked",
        label: "<bool> Boolean.",
        scope: "set_faction_research_unlocked = yes",
    },
    {
        key: "end_puppet",
        label: "<country> The target country.",
        scope: "end_puppet = GER",
    },
    {
        key: "add_autonomy_ratio",
        label: "value = <float> The freedom score to add. localization = <string> The localizati",
        scope: "add_autonomy_ratio = { value = 0.1 localization = AST_adopt_westminster }",
    },
    {
        key: "add_autonomy_score",
        label: "value = <float> The freedom score to add. localization = <string> The localizati",
        scope: "add_autonomy_score = { value = 10 localization = EXAMPLE }",
    },
    {
        key: "add_legitimacy",
        label: "Adds legitimacy to a government in exile.",
        scope: "add_legitimacy = 10",
    },
    {
        key: "set_legitimacy",
        label: "Sets the legitimacy of governments in exile.",
        scope: "set_legitimacy = 10",
    },
    {
        key: "become_exiled_in",
        label: "Makes a country a government in exile in a set country, with a set starting legi",
        scope: "become_exiled_in = { target = <Host tag> legitimacy = <0-100> (starting legitimacy, optional) }",
    },
    {
        key: "end_exile",
        label: "Ends a government in exile.",
        scope: "end_exile = yes",
    },
    {
        key: "add_threat",
        label: "<int> The amount to change by.",
        scope: "add_threat = 10",
    },
    {
        key: "add_named_threat",
        label: "threat = <int> The amount to change by. name = <string> The localization string.",
        scope: "add_named_threat = { threat = 5 name = GER_rhineland }",
    },
    {
        key: "add_to_war",
        label: "targeted_alliance = <country> The country to assist. enemy = <country> The count",
        scope: "add_to_war = { targeted_alliance = PREV enemy = HUN hostility_reason = asked_to_join }",
    },
    {
        key: "start_peace_conference",
        label: "tag = <country> / <variable> The scope to peace with. score_factor = <decimal> /",
        scope: "start_peace_conference = { tag = GER score_factor = 0.4 message = my_peace_tt }",
    },
    {
        key: "set_truce",
        label: "target = <country> The scope to truce with. days = <int> The duration of the tru",
        scope: "set_truce = { target = GER days = 90 }",
    },
    {
        key: "create_wargoal",
        label: "target = <country> / <variable> The country to target. type = <wargoal> The warg",
        scope: "create_wargoal = { type = puppet_wargoal_focus target = ROOT } create_wargoal = { type = take_state_focus target = PREV generator = { 123 321 } expire = 90 }",
    },
    {
        key: "remove_wargoal",
        label: "target = <country> / <variable> The country to target. type = <wargoal> The warg",
        scope: "remove_wargoal = { type = all target = ROOT }",
    },
    {
        key: "add_civil_war_target",
        label: "<country> - The country to set as the target.",
        scope: "add_civil_war_target = TAG",
    },
    {
        key: "remove_civil_war_target",
        label: "<country> - The country to set as the target.",
        scope: "remove_civil_war_target = TAG",
    },
    {
        key: "transfer_units_fraction",
        label: "target = <country> The country which should receive the units from the current s",
        scope: "transfer_units_fraction= { target = SPD size = 0.5 stockpile_ratio = 0.8 army_ratio = 0.8 navy_ratio = 0.5 air_ratio = 0.5 keep_unit_leaders_trigger = { has_trait = trait_SPA_nationalist_sympathies } }",
    },
    {
        key: "add_nuclear_bombs",
        label: "Adds nuclear bomb to TAG's stockpile.",
        scope: "add_nuclear_bombs = 100",
    },
    {
        key: "launch_nuke",
        label: "province = <ID> The specific province to nuke. state = <ID> The state to nuke. c",
        scope: "launch_nuke = { province = 1234 } launch_nuke = { state = 42 controller = GER use_nuke = yes nuke_type = nuclear_bomb }",
    },
    {
        key: "create_import",
        label: "resource = <resource> The resource to import. amount = <int> The amount of resou",
        scope: "create_import = { resource = steel amount = 100 exporter = GER }",
    },
    {
        key: "give_resource_rights",
        label: "receiver = <tag> The country that would get the resource rights. state = <state>",
        scope: "give_resource_rights = { receiver = ENG state = 291 } give_resource_rights = { receiver = POL state = 321 resources = { oil } }",
    },
    {
        key: "remove_resource_rights",
        label: "<state> The state to remove current country's resource rights from.",
        scope: "ENG = { remove_resource_rights = 477 }",
    },
    {
        key: "set_fuel",
        label: "<int> Fuel amount.",
        scope: "set_fuel = 400",
    },
    {
        key: "set_fuel_ratio",
        label: "<decimal> The needed ratio of fuel.",
        scope: "set_fuel_ratio = 0.5",
    },
    {
        key: "add_offsite_building",
        label: "type = <building> The building to add. level = <level> / <variable> The maximum ",
        scope: "add_offsite_building = { type = arms_factory level = 1 }",
    },
    {
        key: "modify_building_resources",
        label: "building = <building> The building to modify. resource = <resource> The resource",
        scope: "modify_building_resources = { building = synthetic_refinery resource = oil amount = 1 }",
    },
    {
        key: "damage_building",
        label: "type = <building> The building to damage. state = <id> / <variable> The state to",
        scope: "damage_building = { type = infrastructure state = 123 damage = 1 } damage_building = { tags = dam_building damage = 1 repair_speed_modifier = -0.8 province = 3488 }",
    },
    {
        key: "uncomplete_national_focus",
        label: "focus = <focus> uncomplete_children = <bool> Defaults \"no\". Optional. refund_pol",
        scope: "uncomplete_national_focus = { focus = GER_oppose_hitler uncomplete_children = yes refund_political_power = no }",
    },
    {
        key: "activate_shine_on_focus",
        label: "<focus> The focus to activate a shine effect on.",
        scope: "activate_shine_on_focus = my_focus",
    },
    {
        key: "deactivate_shine_on_focus",
        label: "<focus> The focus to deactivate a shine effect on.",
        scope: "deactivate_shine_on_focus = my_focus",
    },
    {
        key: "reduce_focus_completion_cost",
        label: "focus = <focus> The focus to reduce cost time. cost = <int> / <variable> Time to",
        scope: "reduce_focus_completion_cost = { focus = focus_id cost = 35 } reduce_focus_completion_cost = { focus = {focus_id_1 focus_id_2} cost = 35 }",
    },
    {
        key: "activate_targeted_decision",
        label: "target = <country> The country to target. decision = <decision> The decision to ",
        scope: "activate_targeted_decision = { target = GER decision = my_decision }",
    },
    {
        key: "remove_targeted_decision",
        label: "<decision> The decision to remove.",
        scope: "remove_targeted_decision = { target = FROM decision = my_decision }",
    },
    {
        key: "unlock_decision_tooltip",
        label: "<decision> The decision to display. <show_effect_tooltip> Show decision effects ",
        scope: "unlock_decision_tooltip = my_decision unlock_decision_tooltip = { decision = my_decision show_effect_tooltip = yes show_modifiers = yes }",
    },
    {
        key: "unlock_decision_category_tooltip",
        label: "<category> The decision category to display.",
        scope: "unlock_decision_category_tooltip = my_category",
    },
    {
        key: "remove_decision",
        label: "Allows to remove specified decision without running remove_effect.",
        scope: "remove_decision = GER_MEPO",
    },
    {
        key: "remove_decision_on_cooldown",
        label: "<decision> The decision that is to be removed.",
        scope: "remove_decision_on_cooldown = TAG_my_decision",
    },
    {
        key: "activate_mission",
        label: "<mission> The mission to activate.",
        scope: "activate_mission = my_mission",
    },
    {
        key: "activate_mission_tooltip",
        label: "<mission> The mission to display.",
        scope: "activate_mission_tooltip = my_mission",
    },
    {
        key: "remove_mission",
        label: "<mission> The mission to remove.",
        scope: "remove_mission = my_mission",
    },
    {
        key: "add_days_mission_timeout",
        label: "mission = <mission> The mission to add days to. days = <int> / <variable> The nu",
        scope: "add_days_mission_timeout = { mission = my_mission days = 20 }",
    },
    {
        key: "add_research_slot",
        label: "<int> The number of slots to add or remove.",
        scope: "add_research_slot = 1",
    },
    {
        key: "set_research_slots",
        label: "<int> The number of slots to set.",
        scope: "set_research_slots = 4",
    },
    {
        key: "add_to_tech_sharing_group",
        label: "<string> The group to add the current scope to.",
        scope: "add_to_tech_sharing_group = us_research",
    },
    {
        key: "remove_from_tech_sharing_group",
        label: "<string> The group to remove the current scope from.",
        scope: "remove_from_tech_sharing_group = us_research",
    },
    {
        key: "modify_tech_sharing_bonus",
        label: "id = <string> The group to modify. bonus = <float> The new bonus.",
        scope: "modify_tech_sharing_bonus = { id = us_research bonus = 0.5 }",
    },
    {
        key: "inherit_technology",
        label: "<tag> The country to inherit technology from.",
        scope: "inherit_technology = CAN",
    },
    {
        key: "mark_technology_tree_layout_dirty",
        label: "<bool> Boolean.",
        scope: "mark_technology_tree_layout_dirty = yes",
    },
    {
        key: "modify_timed_idea",
        label: "idea = <idea> The idea to modify. days = <int> / <variable> The number of days t",
        scope: "modify_timed_idea = { idea = my_idea days = 60 }",
    },
    {
        key: "remove_ideas_with_trait",
        label: "<trait> The trait to target.",
        scope: "remove_ideas_with_trait = motorized_equipment_manufacturer",
    },
    {
        key: "show_ideas_tooltip",
        label: "<idea> The idea to display.",
        scope: "show_ideas_tooltip = my_idea",
    },
    {
        key: "load_oob",
        label: "<oob> The filename of the order of battle to load, without the .txt extension.",
        scope: "load_oob = \"GER_default\"",
    },
    {
        key: "division_template",
        label: "name The name of the division. regiments = { <unit> = { x = 0 y = 0 } } support ",
        scope: "division_template = { name = \"Test\" is_locked = yes division_cap = 3 division_names_group = USA_INF_01 priority = 0 template_counter = 0 regiments = { infantry = { x = 0 y = 0 } infantry = { x = 0 y = 1 } infantry = { x = 0 y = 2 } infantry = { x = 0 y = 3 } } support = { military_police = { x = 0 y = 0 } } }",
    },
    {
        key: "create_colonial_division_template",
        label: "subject = <country> Country tag for an overlords subject. division_template = { ",
        scope: "create_colonial_division_template = { subject = RAJ division_template = { name = \"Infantry Division\" division_names_group = RAJ_INF_01 ... regiments = { infantry = { x = 0 y = 0 } infantry = { x = 0 y = 1 } } } }",
    },
    {
        key: "add_units_to_division_template",
        label: "template_name = <string> The template to change. Optional if used in division sc",
        scope: "add_units_to_division_template = { template_name = \"Test\" regiments = { infantry = 2 infantry = 2 } support = { military_police = 0 } }",
    },
    {
        key: "set_division_template_lock",
        label: "division_template = <string> The name of the division template. is_locked = <boo",
        scope: "set_division_template_lock = { division_template = \"Infantry Division\" is_locked = yes }",
    },
    {
        key: "country_lock_all_division_template",
        label: "<bool> Boolean. OR is_locked = <bool> Boolean. desc = <loc_key> Tooltip.",
        scope: "country_lock_all_division_template = yes country_lock_all_division_template = { is_locked = yes desc = loc_key }",
    },
    {
        key: "set_division_force_allow_recruiting",
        label: "division_template = <string> Template to modify. force_allow_recruiting = <bool>",
        scope: "set_division_force_allow_recruiting = { division_template = \"My locked template\" }",
    },
    {
        key: "set_division_template_cap",
        label: "division_template = <string> The name of the division template. division_cap = <",
        scope: "set_division_template_cap = { division_template = \"Swiss Citizen Militia\" division_cap = SWI_militia_division_cap }",
    },
    {
        key: "clear_division_template_cap",
        label: "division_template = <string> The name of the division template.",
        scope: "clear_division_template_cap = { division_template = \"Swiss Citizen Militia\" }",
    },
    {
        key: "delete_unit_template_and_units",
        label: "division_template = <string> The name of the division template.",
        scope: "delete_unit_template_and_units = { division_template = \"Infantry Division\" disband = yes #will refund equipment and manpower }",
    },
    {
        key: "delete_unit",
        label: "state = <number id> The id number of the state the unit must be in. division_tem",
        scope: "delete_unit = { state = 787 disband = yes #will refund equipment and manpower } delete_unit = { division_template = \"Infantry Division\" } delete_unit = {} # Will delete all units",
    },
    {
        key: "delete_units",
        label: "division_template = <string> The template the units must use to be deleted. disb",
        scope: "delete_units = { division_template = \"Infantry Division\" disband = yes }",
    },
    {
        key: "create_railway_gun",
        label: "equipment = <type> Equipment type used by the railway gun. name = <string> The n",
        scope: "create_railway_gun = { equipment = railway_gun_equipment_1 name = TAG_new_railway_gun location = 12406 }",
    },
    {
        key: "teleport_railway_guns_to_deploy_province",
        label: "<bool> Boolean.",
        scope: "teleport_railway_guns_to_deploy_province = yes",
    },
    {
        key: "add_unit_bonus",
        label: "<subunit> = { ... }",
        scope: "add_unit_bonus = { category_light_infantry = { soft_attack = 0.05 } cavalry = { soft_attack = 0.05 hard_attack = 0.05 } }",
    },
    {
        key: "set_equipment_fraction",
        label: "<float> / <variable> The fraction of equipment to remove.",
        scope: "set_equipment_fraction = 0.5",
    },
    {
        key: "send_equipment",
        label: "type = <equipment> The equipment to add. Can be archetype. amount = <int> / <var",
        scope: "send_equipment = { equipment = infantry_equipment amount = 100 target = GER }",
    },
    {
        key: "send_equipment_fraction",
        label: "value = <0-1> How much equipment to send. target = <country> / <variable> Which ",
        scope: "send_equipment_fraction = { value = 0.3 target = GER }",
    },
    {
        key: "create_production_license",
        label: "target = <country> Which country receives the license. new_prioritised = <boolea",
        scope: "create_production_license = { target = HUN equipment = { type = fighter_equipment_1 version = 0 } new_prioritised = no cost_factor = 0 }",
    },
    {
        key: "add_equipment_subsidy",
        label: "cic = <int> The amount of economic capacity required by the subsidy. equipment_t",
        scope: "add_equipment_subsidy = { cic = 300 equipment_type = support_equipment seller_tags = { BHR } } add_equipment_subsidy = { cic = 1000 equipment_type = infantry_equipment seller_trigger = my_scripted_trigger }",
    },
    {
        key: "add_cic",
        label: "<int> The amount of economic capacity to add.",
        scope: "add_cic = 300",
    },
    {
        key: "create_equipment_variant",
        label: "name = <string> The name of the variant. type = <equipment> The equipment type t",
        scope: "create_equipment_variant = { name = \"Vetehinen Class\" type = ship_hull_submarine_1 name_group = FIN_SS_HISTORICAL role_icon_index = 1 modules = { fixed_ship_torpedo_slot = ship_torpedo_sub_1 fixed_ship_engine_slot = sub_ship_engine_1 rear_1_custom_slot = ship_mine_layer_sub } } create_equipment_variant = { name = \"He 112\" type = fighter_equipment_0 obsolete = yes upgrades = { plane_gun_upgrade = 1 plane_range_upgrade = 1 } } create_equipment_variant = { name = \"Light Tank Mk. IV\" type = light_tank_chassis_1 parent_version = 1 modules = { main_armament_slot = tank_heavy_machine_gun } upgrades = { tank_nsb_engine_upgrade = 2 } icon = \"GFX_ENG_basic_light_tank_medium\" model = ENG_MKIV_light_tank_entity design_team = mio:ENG_vauxhall_organization }",
    },
    {
        key: "add_equipment_production",
        label: "amount = <int> The amount to produce before automatically stopping. Optional. re",
        scope: "add_equipment_production = { equipment = { type = light_cruiser_2 } requested_factories = 1 progress = 0.95 amount = 1 }",
    },
    {
        key: "add_design_template_bonus",
        label: "name = <loc_key> Name. uses = <int> The amount of times the discount can be used",
        scope: "add_design_template_bonus = { name = air_equipment uses = 1 cost_factor = 0.75 equipment = small_plane_airframe equipment = medium_plane_airframe equipment = large_plane_airframe }",
    },
    {
        key: "add_equipment_bonus",
        label: "project = <> Optional, special project scope for using special project name. If ",
        scope: "add_equipment_bonus = { project = FROM bonus = { armor = { # Type of equipment armor_value = 3 soft_attack = 3 instant = yes } small_plane_naval_bomber_airframe = { air_range = 0.1 naval_strike_attack = 0.1 } } }",
    },
    {
        key: "set_equipment_version_number",
        label: "type = <equipment> Equipment type. version = <int> Version to set.",
        scope: "set_equipment_version_number = { type = small_plane_airframe_1 version = 4 }",
    },
    {
        key: "destroy_ships",
        label: "type = <ship> The type of ship to destroy. count = <int> or all The amount to de",
        scope: "destroy_ships = { type = destroyer count = all }",
    },
    {
        key: "transfer_navy",
        label: "target = <country> The target country.",
        scope: "transfer_navy = { target = GER }",
    },
    {
        key: "transfer_ship",
        label: "type = <ship> The type of ship to transfer. target = <country> The target countr",
        scope: "transfer_ship = { prefer_name = \"HMS Achilles\" type = light_cruiser target = NZL exclude_refitting = no }",
    },
    {
        key: "create_ship",
        label: "type = <ship> The type of ship to create. equipment_variant = <string> The equip",
        scope: "FRA = { create_ship = { type = ship_hull_submarine_1 equipment_variant = \"S Class\" creator = ENG name = \"My ship name\" } }",
    },
    {
        key: "add_mines",
        label: "Add mines to a strategic region for the current country.",
        scope: "add_mines = { region = 42 amount = 100 }",
    },
    {
        key: "add_ace",
        label: "name = <string> The name of the ace. surname = <string> The surname of the ace. ",
        scope: "add_ace = { name = \"Amelia\" surname = \"Earhart\" callsign = \"Revenant\" type = fighter_genius is_female = yes }",
    },
    {
        key: "unlock_tactic",
        label: "<string> Tactic to unlock.",
        scope: "unlock_tactic = tactic_masterful_blitz",
    },
    {
        key: "add_doctrine_cost_reduction",
        label: "name = <loc_key> Optional tooltip showing why the doctrine has reduced cost in t",
        scope: "add_doctrine_cost_reduction = { cost_reduction = 0.5 uses = 2 category = land_doctrine }",
    },
    {
        key: "add_mastery",
        label: "amount = <int> Amount of mastery to add. folder = <string> Optional - will filte",
        scope: "add_mastery = { amount = 100 # FILTERS: folder = land grand_doctrine = mobile_warfare sub_doctrine = mobile_infantry track = infantry index = 1 }",
    },
    {
        key: "add_daily_mastery",
        label: "amount = <float> Amount of mastery to add per day. days = <int> Number of days t",
        scope: "add_daily_mastery = { amount = 0.5 days = 90 name = CHI_military_affairs_commission_sea # FILTERS: folder = land grand_doctrine = mobile_warfare sub_doctrine = mobile_infantry track = infantry index = 1 }",
    },
    {
        key: "add_mastery_bonus",
        label: "bonus = <float> Bonus factor, e.g. 0.1 = +10% days = <int> Number of days to app",
        scope: "add_mastery_bonus = { bonus = 0.5 days = 90 name = CHI_military_affairs_commission_sea # FILTERS: folder = land grand_doctrine = mobile_warfare sub_doctrine = mobile_infantry track = infantry index = 1 }",
    },
    {
        key: "set_grand_doctrine",
        label: "<string> Grand doctrine id.",
        scope: "set_grand_doctrine = mobile_warfare",
    },
    {
        key: "set_sub_doctrine",
        label: "<string> Subdoctrine id. OR sub_doctrine = <string> Subdoctrine id. folder = <st",
        scope: "set_sub_doctrine = mobile_infantry set_sub_doctrine = { sub_doctrine = mobile_infantry folder = land track = 1 }",
    },
    {
        key: "create_intelligence_agency",
        label: "name = <string> The name of the intelligence agency. (Optional) icon = <sprite> ",
        scope: "create_intelligence_agency = { name = \"A.G.E.N.C.Y\" icon = GFX_intelligence_agency_logo_agency } create_intelligence_agency = yes",
    },
    {
        key: "upgrade_intelligence_agency",
        label: "Allows to unlock automatically an intelligence agency upgrade",
        scope: "upgrade_intelligence_agency = upgrade_form_department upgrade_intelligence_agency = <upgrade>",
    },
    {
        key: "add_decryption",
        label: "target = <tag> Towards which country to add decryption. amount = <int> How much ",
        scope: "add_decryption = { target = GER amount = 300 } add_decryption = { target = GER ratio = 0.5 }",
    },
    {
        key: "add_intel",
        label: "target = <tag> Towards which country to add intelligence. civilian_intel = <int>",
        scope: "add_intel = { target = GER civilian_intel = 3 army_intel = 2 navy_intel = 1 airforce_intel = 2 }",
    },
    {
        key: "add_operation_token",
        label: "tag = <tag> Towards which country to add a token on. token = <id> Which token to",
        scope: "add_operation_token = { tag = GER token = token_test }",
    },
    {
        key: "remove_operation_token",
        label: "tag = <tag> Towards which country to remove a token from. token = <id> Which tok",
        scope: "remove_operation_token = { tag = GER token = token_test }",
    },
    {
        key: "capture_operative",
        label: "operative = <tag> Which operative to capture. ignore_death_chance = <bool> Wheth",
        scope: "capture_operative = { operative = PREV ignore_death_chance = yes } capture_operative = PREV",
    },
    {
        key: "create_operative_leader",
        label: "bypass_recruitment = <bool> Whether the operative is directly added to the list ",
        scope: "create_operative_leader = { name = \"Jacques Duclos\" GFX = GFX_portrait_jacques_duclos traits = { operative_infiltrator operative_natural_orator } bypass_recruitment = no available_to_spy_master = yes nationalities = { FRA POL } }",
    },
    {
        key: "free_operative",
        label: "<tag> The operative to be freed.",
        scope: "free_operative = PREV",
    },
    {
        key: "free_random_operative",
        label: "captured_by = <tag> The country that captured the operative. all = <bool> Whethe",
        scope: "free_random_operative = { captured_by = POL all = yes }",
    },
    {
        key: "kill_operative",
        label: "operative = <tag> The operative that is killed.",
        scope: "kill_operative = { operative = PREV } kill_operative = PREV",
    },
    {
        key: "turn_operative",
        label: "operative = <tag> The operative that is turned.",
        scope: "turn_operative = { operative = PREV } turn_operative = PREV",
    },
    {
        key: "steal_random_tech_bonus",
        label: "category = <category name> The category to steal from. See /Hearts of Iron IV/co",
        scope: "steal_random_tech_bonus = { category = air_equipment folder = naval_folder ahead_reduction = 0.8 bonus = 1.2 base_bonus = 1.1 dynamic = yes name = LOC_KEY target = POL uses = 2 }",
    },
    {
        key: "set_nationality",
        label: "target_country = <country> / <variable> The target country. character = <charact",
        scope: "set_nationality = { target_country = TZN character = OMA_sultan }",
    },
    {
        key: "retire_character",
        label: "<character>",
        scope: "retire_character = GER_Character_Token",
    },
    {
        key: "set_character_name",
        label: "character = <character> The character to modify. name = <localisation key> The n",
        scope: "set_character_name = { character = my_character name = my_name }",
    },
    {
        key: "character_list_tooltip",
        label: "limit = { <triggers> } Triggers that must be fulfilled to show up in the list. r",
        scope: "character_list_tooltip = { limit = { has_character_flag = SOV_targeted_for_purge_flag } random_select_amount = 4 }",
    },
    {
        key: "add_trait",
        label: "character = <character> The character to modify. slot = <slot> Slot of the chara",
        scope: "add_trait = { character = TAG_jane_smith slot = political_advisor trait = really_good_boss } add_trait = { character = TAG_my_leader ideology = liberalism trait = field_of_gar }",
    },
    {
        key: "remove_trait",
        label: "character = <character> The character to modify. slot = <slot> Slot of the chara",
        scope: "remove_trait = { character = TAG_jane_smith slot = political_advisor trait = really_good_boss } remove_trait = { character = TAG_my_leader ideology = liberalism trait = field_of_gar }",
    },
    {
        key: "create_corps_commander",
        label: "name = <string> The name of the leader. picture = <string> OR portrait_path = <s",
        scope: "create_corps_commander = { name = \"Jean de Lattre de Tassigny\" picture = \"Portrait_France_Jean_de_Lattre_de_Tassigny.dds\" traits = { trickster brilliant_strategist } skill = 4 attack_skill = 4 defense_skill = 2 planning_skill = 4 logistics_skill = 3 }",
    },
    {
        key: "create_field_marshal",
        label: "name = <string> The name of the leader. picture = <string> OR portrait_path = <s",
        scope: "create_field_marshal = { name = \"Maurice Gamelin\" portrait_path = \"GFX_portrait_FRA_maurice_gamelin\" traits = { defensive_doctrine } skill = 2 attack_skill = 1 defense_skill = 3 planning_skill = 2 logistics_skill = 1 }",
    },
    {
        key: "create_navy_leader",
        label: "name = <string> The name of the leader. picture = <string> OR portrait_path = <s",
        scope: "create_navy_leader = { name = \"Fran\u00e7ois Darlan\" gfx = \"GFX_portrait_FRA_francois_darlan\" traits = { superior_tactician } skill = 3 attack_skill = 2 defense_skill = 4 maneuvering_skill = 3 coordination_skill = 2 }",
    },
    {
        key: "remove_unit_leader",
        label: "<id> The id of the unit leader.",
        scope: "remove_unit_leader = 70",
    },
    {
        key: "add_corps_commander_role",
        label: "character = <character> The character to modify. <...> Army leader role definiti",
        scope: "add_corps_commander_role = { Character = GER_Character_token skill = 4 attack_skill = 2 defense_skill = 3 planning_skill = 3 logistics_skill = 5 }",
    },
    {
        key: "add_field_marshal_role",
        label: "character = <character> The character to modify. <...> Army leader role definiti",
        scope: "add_field_marshal_role = { character = GER_Character_token skill = 4 attack_skill = 2 defense_skill = 3 planning_skill = 3 logistics_skill = 5 }",
    },
    {
        key: "add_naval_commander_role",
        label: "character = <character> The character to modify. <...> Navy leader role definiti",
        scope: "add_naval_commander_role = { Character = GER_Character_token skill = 4 attack_skill = 2 defense_skill = 3 planning_skill = 3 logistics_skill = 5 }",
    },
    {
        key: "show_unit_leaders_tooltip",
        label: "<character> The character whose name is to be shown.",
        scope: "show_unit_leaders_tooltip = TAG_my_leader",
    },
    {
        key: "create_country_leader",
        label: "name = <string> The name of the leader. desc = <string> The description of the l",
        scope: "create_country_leader = { name = AFG_mohammed_zahir_shah desc = \"POLITICS_MOHAMMED_ZAHIR_SHAH_DESC\" picture = GFX_AFG_mohammed_zahir_shah expire = \"1965.1.1\" ideology = despotism traits = { } }",
    },
    {
        key: "add_country_leader_role",
        label: "character = <character> The character to modify. country_leader = { ... } Countr",
        scope: "add_country_leader_role = { character = GER_character_token promote_leader = yes country_leader = { ideology = fascism_ideology expire = \"1965.1.1.1\" traits = { war_industrialist } } }",
    },
    {
        key: "promote_character",
        label: "<character> The character to promote. OR character = <character> The character t",
        scope: "promote_character = GER_erwin_rommel promote_character = { character = GER_erwin_rommel ideology = nazism }",
    },
    {
        key: "remove_country_leader_role",
        label: "character = <character> The character to modify. ideology = <string> The ideolog",
        scope: "remove_country_leader_role = { character = GER_Character_Token ideology = socialism }",
    },
    {
        key: "kill_ideology_leader",
        label: "<ideology> Ideology.",
        scope: "kill_ideology_leader = communism",
    },
    {
        key: "retire_ideology_leader",
        label: "<ideology> Ideology.",
        scope: "retire_ideology_leader = fascism",
    },
    {
        key: "kill_country_leader",
        label: "<bool> Boolean.",
        scope: "kill_country_leader = yes",
    },
    {
        key: "retire_country_leader",
        label: "<bool> Boolean.",
        scope: "retire_country_leader = yes",
    },
    {
        key: "set_country_leader_ideology",
        label: "<government> The government to set.",
        scope: "set_country_leader_ideology = socialism",
    },
    {
        key: "set_country_leader_description",
        label: "ideology = <ideology> The ideology of the country leader, optional. desc = <loca",
        scope: "set_country_leader_description = { ideology = neutrality desc = LOC_KEY }",
    },
    {
        key: "set_country_leader_name",
        label: "ideology = <ideology> The ideology of the country leader, optional. name = <loca",
        scope: "set_country_leader_name = { ideology = neutrality name = LOC_KEY }",
    },
    {
        key: "set_country_leader_portrait",
        label: "ideology = <ideology> The ideology of the country leader, optional. portrait = <",
        scope: "set_country_leader_portrait = { ideology = neutrality portrait = GFX_IMAGE_NAME }",
    },
    {
        key: "add_country_leader_trait",
        label: "<trait> The trait to add.",
        scope: "add_country_leader_trait = nationalist_symbol",
    },
    {
        key: "remove_country_leader_trait",
        label: "<trait> The trait to remove.",
        scope: "remove_country_leader_trait = nationalist_symbol",
    },
    {
        key: "swap_ruler_traits",
        label: "Similar to swap_ideas. Removes one trait and adds another.",
        scope: "swap_ruler_traits = { remove = <trait> add = <trait> }",
    },
    {
        key: "activate_advisor",
        label: "<character> The character to activate.",
        scope: "activate_advisor = GER_character_token_air_chief",
    },
    {
        key: "deactivate_advisor",
        label: "<character> The character to deactivate.",
        scope: "deactivate_advisor = GER_character_token_air_chief",
    },
    {
        key: "add_advisor_role",
        label: "character = <character> The character to modify. advisor = { ... } Advisor role ",
        scope: "add_advisor_role = { character = GER_Character_token activate = yes advisor = { slot = air_chief cost = 50 idea_token = GER_character_token_air_chief traits = { air_chief_ground_support_2 } } }",
    },
    {
        key: "remove_advisor_role",
        label: "character = <character> Specifies the character if the effect is executed in cou",
        scope: "remove_advisor_role = { character = \"SOV_genrikh_yagoda\" slot = political_advisor }",
    },
    {
        key: "set_can_be_fired_in_advisor_role",
        label: "character = <character> The character to modify. slot = <slot> The slot of the c",
        scope: "set_can_be_fired_in_advisor_role = { character = BHR_important_advisor value = no }",
    },
    {
        key: "add_scientist_role",
        label: "character = <character> / <variable> The character to modify. <...> Scientist ro",
        scope: "add_scientist_role = { character = my_character / var:my_char_var / PREV scientist = { desc = desc_loc_key traits = { scientist_trait_token ... } skills = { specialization_token = 2 ... } } }",
    },
    {
        key: "remove_scientist_role",
        label: "character = <character> / <variable>",
        scope: "remove_scientist_role = { character = my_character / var:my_char_var / PREV }",
    },
    {
        key: "generate_scientist_character",
        label: "portrait = <GFX> Optional, random portrait by default. portrait_tag_override = <",
        scope: "generate_scientist_character = { portrait = GFX_portrait portrait_tag_override = CHI gender = male skills = { specialization_token = 2 } traits = { trait_token } }",
    },
    {
        key: "show_mio_tooltip",
        label: "<MIO> MIO to display.",
        scope: "show_mio_tooltip = my_mio",
    },
    {
        key: "unlock_military_industrial_organization_tooltip",
        label: "<mio> / <variable> MIO to unlock.",
        scope: "unlock_military_industrial_organization_tooltip = mio:my_mio_token unlock_military_industrial_organization_tooltip = var:my_mio_var",
    },
    {
        key: "unlock_mio_policy_tooltip",
        label: "<policy> Policy to display. OR policy = <policy> Policy to display. show_modifie",
        scope: "unlock_mio_policy_tooltip = my_policy_1 unlock_mio_policy_tooltip = { policy = my_policy_2 show_modifiers = no }",
    },
    {
        key: "add_mio_policy_cost",
        label: "policy = <policy> Policy to modify. value = <int> Amount in political power to a",
        scope: "add_mio_policy_cost = { policy = my_policy value = 10 }",
    },
    {
        key: "set_mio_policy_cost",
        label: "policy = <policy> Policy to modify. value = <int> Amount in political power to s",
        scope: "set_mio_policy_cost = { policy = my_policy value = 100 }",
    },
    {
        key: "add_mio_policy_cooldown",
        label: "policy = <policy> Policy to modify. value = <int> Amount in days to add.",
        scope: "add_mio_policy_cooldown = { policy = my_policy value = 10 }",
    },
    {
        key: "set_mio_policy_cooldown",
        label: "policy = <policy> Policy to modify. value = <int> Amount in days to set.",
        scope: "set_mio_policy_cooldown = { policy = my_policy value = 100 }",
    },
    {
        key: "complete_special_project",
        label: "sp:<project> Project to complete. OR project = sp:<project> Project to complete.",
        scope: "complete_special_project = sp:sp_naval_midget_submarine complete_special_project = { project = sp:sp_naval_midget_submarine scientist = ITA_curio_bernardis state = my_state iteration_output = { my_reward my_other_reward my_third_reward = my_option_1 } show_modifiers = no }",
    },
    {
        key: "add_breakthrough_points",
        label: "specialization = <dp_specialization_id> The specialization e.g. specialization_l",
        scope: "add_breakthrough_points = { specialization = specialization_land value = 3 } add_breakthrough_points = { specialization = all value = 1 }",
    },
    {
        key: "add_breakthrough_progress",
        label: "specialization = <dp_specialization_id> The specialization e.g. specialization_l",
        scope: "add_breakthrough_progress = { specialization = specialization_land value = 3 } add_breakthrough_progress = { specialization = all value = sp_breakthrough_progress.medium }",
    },
    {
        key: "career_profile_step_missiolini",
        label: "<bool> Boolean.",
        scope: "career_profile_step_missiolini = yes",
    },
    {
        key: "recruit_character",
        label: "<character>",
        scope: "recruit_character = GER_Character_token",
    },
    {
        key: "generate_character",
        label: "token_base = <string> Mandatory, acts as the character token. name = <localisati",
        scope: "generate_character = { token_base = army_chief_defensive_1 name = funny_name advisor = { slot = air_chief cost = 50 idea_token = GER_character_token_air_chief traits = { air_chief_ground_support_2 } allowed = { always = yes } } }",
    },
    {
        key: "set_oob",
        label: "<order of battle> The name of the file used for the order of battle without the ",
        scope: "set_oob = BHR_1936",
    },
    {
        key: "set_naval_oob",
        label: "<order of battle> The name of the file used for the order of battle without the ",
        scope: "set_naval_oob = BHR_1936_naval_legacy",
    },
    {
        key: "set_air_oob",
        label: "<order of battle> The name of the file used for the order of battle without the ",
        scope: "set_air_oob = ITA_1936_air_bba",
    },
    {
        key: "set_keyed_oob",
        label: "key = <string> The key used for the file. name = <order of battle> The name of t",
        scope: "set_keyed_oob = { key = naval name = BHR_1936_mtg }",
    },
    {
        key: "get_highest_scored_country_temp",
        label: "scorer = <???> Id that is used in country scorer. var Variable name that the res",
        scope: "get_highest_scored_country_temp = { scorer = scorer_id var = var_name }",
    },
    {
        key: "get_sorted_scored_countries_temp",
        label: "scorer = <???> Id that is used in country scorer. array = <string> A name to sto",
        scope: "get_sorted_scored_countries_temp = { scorer = scorer_id array = array_name scores = array_name }",
    },
    {
        key: "get_supply_vehicles",
        label: "var = <string> Variable name to set. type = <type> Can be truck or train. need =",
        scope: "get_supply_vehicles = { var = trucks_needed type = truck need = yes }",
    },
    {
        key: "get_supply_vehicles_temp",
        label: "var = <string> Variable name to set. type = <type> Can be truck or train. need =",
        scope: "get_supply_vehicles_temp = { var = trucks_needed type = truck need = yes }",
    },
    {
        key: "state_event",
        label: "id = <event> The event to fire. days = <int> / <variable> Fires the event in the",
        scope: "state_event = { id = my_event.1 days = 10 random = 50 random_days = 10 trigger_for = controller }",
    },
    {
        key: "set_state_flag",
        label: "<flag> An unique string to identify the state flag with. OR flag = <flag> The fl",
        scope: "set_state_flag = my_flag set_state_flag = { flag = my_flag days = 123 value = 1 }",
    },
    {
        key: "clr_state_flag",
        label: "<flag> The unique string of a state flag to clear.",
        scope: "clr_state_flag = my_flag",
    },
    {
        key: "modify_state_flag",
        label: "flag = <flag> The flag to modify. value = <value> The value to add to the flag. ",
        scope: "modify_state_flag = { flag = my_flag value = 3 }",
    },
    {
        key: "set_state_name",
        label: "<string> Defines the new name.",
        scope: "set_state_name = \"Funland\"",
    },
    {
        key: "reset_state_name",
        label: "<bool> Boolean.",
        scope: "reset_state_name = yes",
    },
    {
        key: "remove_claim_by",
        label: "<country> / <variable> The country to remove the claim for.",
        scope: "remove_claim_by = SOV",
    },
    {
        key: "remove_core_of",
        label: "<country> / <variable> The country to remove the core for.",
        scope: "remove_core_of = SOV",
    },
    {
        key: "set_demilitarized_zone",
        label: "<bool> Boolean.",
        scope: "set_demilitarized_zone = yes",
    },
    {
        key: "set_state_category",
        label: "<category> The category to change to.",
        scope: "set_state_category = rural",
    },
    {
        key: "add_state_modifier",
        label: "Modifier scope <modifier> = <float> Adds a modifier to the state.",
        scope: "add_state_modifier = { modifier = { local_resources = 2.0 } }",
    },
    {
        key: "set_border_war",
        label: "<bool> Boolean.",
        scope: "set_border_war = yes",
    },
    {
        key: "create_unit",
        label: "division = <division string> The division string. owner = <country> The owner of",
        scope: "create_unit = { division = \"name = \\\"Infantry Division\\\" division_template = \\\"Infantry Division\\\" start_experience_factor = 0.5\" owner = GER } create_unit = { division = \"name = \\\"Artie\\\" division_template = \\\"Artillery Division\\\" start_manpower_factor = 0.3\" owner = BHR count = 3 allow_spawning_on_enemy_provs = yes country_score = { base = 3 modifier = { factor = 2 tag = OMA } } id = 123 } create_unit = { division = \"name = \\\"Tank division\\\" division_template = \\\"Tank Division\\\" start_manpower_factor = 1 force_equipment_variants = { medium_tank_chassis_2 = { owner = \\\"USA\\\" amount = 100 version_name = \\\"M4 Sherman\\\" }}\" owner = USA count = 1 }",
    },
    {
        key: "teleport_armies",
        label: "limit = { <triggers> } The condition that must be true for the owner of the armi",
        scope: "teleport_armies = { limit = { has_war_together_with = ROOT } to_state_array = owned_controlled_states }",
    },
    {
        key: "add_province_modifier",
        label: "static_modifiers = { <modifiers> } The list of modifiers. province = <id> The pr",
        scope: "add_province_modifier = { static_modifiers = { mod_modifier_1 mod_modifier_2 } province = 1234 } add_province_modifier = { static_modifiers = { mod_modifier_1 mod_modifier_2 } province = { id = 1234 id = 4321 days = 7 } } add_province_modifier = { static_modifiers = { mod_modifier_1 mod_modifier_2 } province = { all_provinces = yes limit_to_coastal = yes limit_to_border = yes limit_to_naval_base = yes limit_to_victory_point = yes } }",
    },
    {
        key: "remove_province_modifier",
        label: "static_modifiers = { <modifiers> } The list of modifiers. province = <id> The pr",
        scope: "remove_province_modifier = { static_modifiers = { mod_modifier_1 mod_modifier_2 } province = 1234 } remove_province_modifier = { static_modifiers = { mod_modifier_1 mod_modifier_2 } province = { id = 1234 id = 4321 } } remove_province_modifier = { static_modifiers = { mod_modifier_1 mod_modifier_2 } province = { all_provinces = yes limit_to_coastal = yes limit_to_border = yes limit_to_naval_base = yes limit_to_victory_point = yes } }",
    },
    {
        key: "add_victory_points",
        label: "Add victory points to a province",
        scope: "add_victory_points = { province = 1234 value = 10 }",
    },
    {
        key: "set_victory_points",
        label: "Set the victory points of a province",
        scope: "set_victory_points = { province = 1234 value = 10 }",
    },
    {
        key: "set_state_province_controller",
        label: "controller = <tag> The new controller of the province. limit = { <triggers> } Th",
        scope: "set_state_province_controller = { controller = POL limit = { OR = { tag = GER is_in_faction_with = GER } } }",
    },
    {
        key: "transfer_state_to",
        label: "<country> Country to transfer the state to.",
        scope: "transfer_state_to = JAM",
    },
    {
        key: "set_state_owner_to",
        label: "<country> Country to set the owner (but not the controller) of the state to.",
        scope: "set_state_owner_to = JAM",
    },
    {
        key: "set_state_controller_to",
        label: "<country> Country to set the controller (but not the owner) of the state to.",
        scope: "set_state_controller_to = ITA",
    },
    {
        key: "strategic_province_location",
        label: "<string> = <int>",
        scope: "strategic_province_location = { defensible_coastline = 10124 }",
    },
    {
        key: "strategic_state_location",
        label: "<string> = <int>",
        scope: "strategic_state_location = { favorable_approach = 11932 }",
    },
    {
        key: "add_extra_state_shared_building_slots",
        label: "<int> / <variable> The amount of slots to add or remove.",
        scope: "add_extra_state_shared_building_slots = 2",
    },
    {
        key: "add_building_construction",
        label: "type = <string> The building to add. level = <int> / <variable> The level to set",
        scope: "add_building_construction = { type = arms_factory level = 5 instant_build = yes } add_building_construction = { type = bunker level = 10 instant_build = yes province = { all_provinces = yes limit_to_border = yes limit_to_victory_point > 1 } } add_building_construction = { type = bunker level = 1 instant_build = yes province = 2999 }",
    },
    {
        key: "set_building_level",
        label: "type = <string> The building to add. level = <int> / <variable> The level to set",
        scope: "set_building_level = { type = infrastructure level = 10 instant_build = yes } set_building_level = { type = bunker level = 3 province = { all_provinces = yes limit_to_border = yes level < 3 } }",
    },
    {
        key: "remove_building",
        label: "type = <building> The building to remove. tag = <building_tag> The buildings wit",
        scope: "remove_building = { type = arms_factory level = 5 } remove_building = { tag = facility level = 1 }",
    },
    {
        key: "construct_building_in_random_province",
        label: "<building> = <int> Building to build.",
        scope: "65 = { construct_building_in_random_province = { land_facility = 1 } }",
    },
    {
        key: "add_compliance",
        label: "<int> / <variable> The amount to add.",
        scope: "add_compliance = 30",
    },
    {
        key: "add_resistance",
        label: "<int> / <variable> The amount to add.",
        scope: "add_resistance = 30",
    },
    {
        key: "add_resistance_target",
        label: "<int> / <variable> The amount to add.",
        scope: "add_resistance_target = 30",
    },
    {
        key: "cancel_resistance",
        label: "<bool> Boolean.",
        scope: "cancel_resistance = yes",
    },
    {
        key: "force_disable_resistance",
        label: "<country> The target country.",
        scope: "force_disable_resistance = GER",
    },
    {
        key: "force_enable_resistance",
        label: "<country> The target country.",
        scope: "force_enable_resistance = GER",
    },
    {
        key: "remove_resistance_target",
        label: "<int> / <variable> The id of the resistance target to remove. (Must be set with ",
        scope: "remove_resistance_target = 30",
    },
    {
        key: "set_compliance",
        label: "<int> / <variable> The amount to set the compliance to.",
        scope: "set_compliance = 30",
    },
    {
        key: "set_resistance",
        label: "<int> / <variable> The amount to set the resistance to.",
        scope: "set_resistance = 30",
    },
    {
        key: "start_resistance",
        label: "<bool>/<country> Whether to start resistance or not. If using a country as the p",
        scope: "start_resistance = POL start_resistance = yes",
    },
    {
        key: "set_garrison_strength",
        label: "<0-1> The new garrison strength.",
        scope: "set_garrison_strength = 0.5",
    },
    {
        key: "raid_reduce_project_progress_ratio",
        label: "<float> Value to reduce.",
        scope: "raid_reduce_project_progress_ratio = 0.1",
    },
    {
        key: "set_character_flag",
        label: "<flag> An unique string to identify the character flag with. OR flag = <flag> Th",
        scope: "set_character_flag = my_flag set_character_flag = { flag = my_flag days = 123 value = 1 }",
    },
    {
        key: "modify_character_flag",
        label: "flag = <flag> The flag to modify. value = <value> The value to add to the flag. ",
        scope: "modify_character_flag = { flag = my_flag value = 3 }",
    },
    {
        key: "clr_character_flag",
        scope: "clr_character_flag = <bool>",
    },
    {
        key: "retire",
        label: "<bool> Boolean>",
        scope: "retire = yes",
    },
    {
        key: "set_portraits",
        label: "character = <character> The character name. Optional if in character scope. Army",
        scope: "set_portraits = { character = my_character army = { small =\"MySmallCharacterGFX\" } civilian = { large =\"MyLargeCharacterGFX\" } }",
    },
    {
        key: "add_scientist_level",
        label: "level = <int> / <variable> Level to add. specialization = <specialization> Speci",
        scope: "add_scientist_level = { level = 2 specialization = specialization_nuclear }",
    },
    {
        key: "injure_scientist_for_days",
        label: "<int> / <variable> Amount of days to apply injure.",
        scope: "injure_scientist_for_days = 12",
    },
    {
        key: "add_scientist_trait",
        label: "<trait> Trait to add.",
        scope: "add_scientist_trait = my_trait_token",
    },
    {
        key: "add_scientist_xp",
        label: "experience = <int> / <variable> Expierience to add. specialization = <specializa",
        scope: "add_scientist_xp = { experience = 2 specialization = specialization_nuclear }",
    },
    {
        key: "unit_leader_event",
        label: "id = <event> The event to fire. days = <int> / <variable> Fires the event in the",
        scope: "unit_leader_event = { id = my_event.1 days = 10 random = 50 random_days = 10 }",
    },
    {
        key: "set_unit_leader_flag",
        label: "<flag> An unique string to identify the unit leader flag with.",
        scope: "set_unit_leader_flag = my_flag",
    },
    {
        key: "clr_unit_leader_flag",
        label: "<flag> The unique string of a unit leader flag to clear.",
        scope: "clr_unit_leader_flag = my_flag",
    },
    {
        key: "modify_unit_leader_flag",
        label: "flag = <flag> The flag to modify. value = <value> The value to add to the flag. ",
        scope: "modify_unit_leader_flag = { flag = my_flag value = 3 }",
    },
    {
        key: "promote_leader",
        label: "<bool> Boolean",
        scope: "promote_leader = yes",
    },
    {
        key: "demote_leader",
        label: "<bool> Boolean",
        scope: "demote_leader = yes",
    },
    {
        key: "add_unit_leader_trait",
        label: "<trait> The trait to add.",
        scope: "add_unit_leader_trait = old_guard",
    },
    {
        key: "remove_unit_leader_trait",
        label: "<trait> The trait to remove.",
        scope: "remove_unit_leader_trait = old_guard",
    },
    {
        key: "add_random_trait",
        label: "<trait> The trait to add.",
        scope: "add_random_trait = { old_guard brilliant_strategist inflexible_strategist }",
    },
    {
        key: "add_timed_unit_leader_trait",
        label: "<trait> The trait to add. days = <int> The duration of the trait.",
        scope: "add_timed_unit_leader_trait = { trait = wounded days = 90 }",
    },
    {
        key: "replace_unit_leader_trait",
        label: "trait = <trait> The trait to replace. replace = <trait> The new trait to add.",
        scope: "replace_unit_leader_trait = { trait = old_guard replace = brilliant_strategist }",
    },
    {
        key: "remove_exile_tag",
        label: "Remove the exile tag on an army leader, making them no longer be considered exil",
        scope: "remove_exile_tag = yes",
    },
    {
        key: "gain_xp",
        label: "<int>",
        scope: "gain_xp = 5",
    },
    {
        key: "remove_unit_leader_role",
        label: "<bool> Boolean.",
        scope: "remove_unit_leader_role = yes",
    },
    {
        key: "swap_country_leader_traits",
        label: "remove = <trait> Trait to remove add = <trait> Trait to add ideology = <sub-ideo",
        scope: "swap_country_leader_traits = { remove = nationalist_symbol add = anti_communist ideology = marxism }",
    },
    {
        key: "supply_units",
        label: "<int> / <variable> The amount of hours of supply.",
        scope: "supply_units = 24",
    },
    {
        key: "add_max_trait",
        label: "<int> The amount to add.",
        scope: "add_max_trait = 1",
    },
    {
        key: "add_skill_level",
        label: "<int> The skill to add.",
        scope: "add_skill_level = 1",
    },
    {
        key: "add_logistics",
        label: "<int> How many skill levels to add.",
        scope: "add_logistics = 1",
    },
    {
        key: "add_planning",
        label: "<int> How many skill levels to add.",
        scope: "add_planning = 1",
    },
    {
        key: "add_defense",
        label: "<int> How many skill levels to add.",
        scope: "add_defense = 1",
    },
    {
        key: "add_attack",
        label: "<int> How many skill levels to add.",
        scope: "add_attack = 1",
    },
    {
        key: "add_coordination",
        label: "<int> How many skill levels to add.",
        scope: "add_coordination = 1",
    },
    {
        key: "add_maneuver",
        label: "<int> How many skill levels to add.",
        scope: "add_maneuver = 1",
    },
    {
        key: "add_temporary_buff_to_units",
        label: "combat_offense = <float> The bonus to grant. Optional. combat_breakthrough = <fl",
        scope: "add_temporary_buff_to_units = { combat_offense = 0.25 combat_breakthrough = 0.25 org_damage_multiplier = -1.0 str_damage_multiplier = 0.25 war_support_reduction_on_damage = 0.2 cannot_retreat_while_attacking = 1.0 days = 7 tooltip = ABILITY_FORCE_ATTACK_TOOLTIP }",
    },
    {
        key: "add_nationality",
        label: "<tag> The country to set the nationality to.",
        scope: "add_nationality = GER",
    },
    {
        key: "force_operative_leader_into_hiding",
        label: "<bool>",
        scope: "force_operative_leader_into_hiding = yes",
    },
    {
        key: "harm_operative_leader",
        label: "<int> How much to harm the operative.",
        scope: "harm_operative_leader = 12",
    },
    {
        key: "operative_leader_event",
        label: "id = <event> The event to fire. days = <int> / <variable> Fires the event in the",
        scope: "operative_leader_event = { id = my_event.1 originator = POL recipient = GER days = 10 random = 50 random_days = 10 set_from = ENG set_root = SOV set_from_from = FRA }",
    },
    {
        key: "destroy_unit",
        label: "<bool> Boolean.",
        scope: "destroy_unit = yes",
    },
    {
        key: "add_history_entry",
        label: "key = <localisation key> The name of the entry. subject = \"<string>\" Logged entr",
        scope: "add_history_entry = { key = my_history_entry subject = \"Test entry\" allow = no }",
    },
    {
        key: "change_division_template",
        label: "<string> The name of the division.",
        scope: "change_division_template = { division_template = \"New template\" }",
    },
    {
        key: "add_random_valid_trait_from_unit",
        label: "<character> Character to grant the trait to.",
        scope: "add_random_valid_trait_from_unit = FROM",
    },
    {
        key: "add_unit_medal_to_latest_entry",
        label: "unit_medals = <medal ID> The medal to add.",
        scope: "add_unit_medal_to_latest_entry = { unit_medals = my_medal }",
    },
    {
        key: "add_divisional_commander_xp",
        label: "<decimal> Experience to add.",
        scope: "add_divisional_commander_xp = 10",
    },
    {
        key: "reseed_division_commander",
        label: "<int> The seed to use.",
        scope: "reseed_division_commander = 760",
    },
    {
        key: "promote_officer_to_general",
        label: "<bool> Boolean.",
        scope: "promote_officer_to_general = yes",
    },
    {
        key: "set_unit_organization",
        label: "<decimal> The level to set to.",
        scope: "set_unit_organization = 0.3",
    },
    {
        key: "add_mio_funds",
        label: "<int> Funds to add.",
        scope: "add_mio_funds = 1000",
    },
    {
        key: "set_mio_funds",
        label: "<int> Amount to set.",
        scope: "set_mio_funds = 1000",
    },
    {
        key: "add_mio_funds_gain_factor",
        label: "<decimal> Amount to add.",
        scope: "add_mio_funds_gain_factor = 0.1",
    },
    {
        key: "set_mio_funds_gain_factor",
        label: "<decimal> Amount to set.",
        scope: "set_mio_funds = 0.1",
    },
    {
        key: "add_mio_size",
        label: "<int> Amount to add.",
        scope: "add_mio_size = 2",
    },
    {
        key: "add_mio_size_up_requirement_factor",
        label: "<decimal> Amount to add.",
        scope: "add_mio_size_up_requirement_factor = 0.1",
    },
    {
        key: "set_mio_size_up_requirement_factor",
        label: "<decimal> Amount to set.",
        scope: "set_mio_size_up_requirement_factor = 0.1",
    },
    {
        key: "add_mio_task_capacity",
        label: "<int> Amount to add.",
        scope: "add_mio_task_capacity = 2",
    },
    {
        key: "set_mio_task_capacity",
        label: "<int> Amount to set.",
        scope: "set_mio_task_capacity = 2",
    },
    {
        key: "add_mio_research_bonus",
        label: "<decimal> Amount to add.",
        scope: "add_mio_research_bonus = 0.3",
    },
    {
        key: "set_mio_research_bonus",
        label: "<decimal> Amount to set.",
        scope: "set_mio_research_bonus = 0.3",
    },
    {
        key: "set_mio_name_key",
        label: "<localisation key> The new name.",
        scope: "set_mio_name_key = mio_new_name",
    },
    {
        key: "set_mio_icon",
        label: "<sprite> The new sprite .",
        scope: "set_mio_icon = GFX_new_mio_icon",
    },
    {
        key: "add_mio_design_team_assign_cost",
        label: "<decimal> Amount to add.",
        scope: "add_mio_design_team_assign_cost = 0.3",
    },
    {
        key: "set_mio_design_team_assign_cost",
        label: "<decimal> Amount to set.",
        scope: "set_mio_design_team_assign_cost = 0.3",
    },
    {
        key: "add_mio_industrial_manufacturer_assign_cost",
        label: "<decimal> Amount to add.",
        scope: "add_mio_industrial_manufacturer_assign_cost = 0.3",
    },
    {
        key: "set_mio_industrial_manufacturer_assign_cost",
        label: "<decimal> Amount to set.",
        scope: "set_mio_industrial_manufacturer_assign_cost = 0.3",
    },
    {
        key: "add_mio_design_team_change_cost",
        label: "<decimal> Amount to add.",
        scope: "add_mio_design_team_change_cost = 0.3",
    },
    {
        key: "set_mio_design_team_change_cost",
        label: "<decimal> Amount to set.",
        scope: "set_mio_design_team_change_cost = 0.3",
    },
    {
        key: "unlock_mio_trait_tooltip",
        label: "<trait> Trait to display. OR trait = <trait> Trait to display. show_modifiers = ",
        scope: "unlock_mio_trait_tooltip = my_trait_1 unlock_mio_trait_tooltip = { trait = my_trait_2 show_modifiers = no }",
    },
    {
        key: "complete_mio_trait",
        label: "<trait> Trait to complete. OR trait = <trait> Trait to complete. show_modifiers ",
        scope: "complete_mio_trait = my_trait_1 complete_mio_trait = { trait = my_trait_2 show_modifiers = no }",
    },
    {
        key: "set_mio_flag",
        label: "<flag> An unique string to identify the MIO flag with. OR flag = <flag> The flag",
        scope: "set_mio_flag = my_flag set_mio_flag = { flag = my_flag days = 123 value = 1 }",
    },
    {
        key: "clr_mio_flag",
        label: "<flag> The unique string of a country flag to clear.",
        scope: "clr_mio_flag = my_flag",
    },
    {
        key: "modify_mio_flag",
        label: "flag = <flag> The flag to modify. value = <value> The value to add to the flag. ",
        scope: "modify_mio_flag = { flag = my_flag value = 3 }",
    },
    {
        key: "cancel_purchase_contract",
        label: "<bool> Boolean.",
        scope: "cancel_purchase_contract = yes",
    },
    {
        key: "add_raid_history_entry",
        label: "<bool>",
        scope: "add_raid_history_entry = yes/no",
    },
    {
        key: "raid_add_unit_experience",
        label: "<float> Can use either an explicit value or a variable",
        scope: "raid_add_unit_experience = 0.2",
    },
    {
        key: "raid_damage_units",
        label: "<flag> An unique string to identify the project flag with. OR damage = <float/in",
        scope: "# Apply 50% damage to units raid_damage_units = { damage = 0.5 ratio = yes } # Apply 10 strength loss and 20 organization loss to units raid_damage_units = { org_damage = 20 str_damage = 10 } # Lose 40% of all planes raid_damage_units = { plane_loss = 0.4 ratio = yes } # Lose 5 planes raid_damage_units = { plane_loss = 5 }",
    },
    {
        key: "add_project_progress_ratio",
        label: "<float> remove or add between -1 and 1 proect progress",
        scope: "sp:my_project = { add_project_progress_ratio = 0.1 add_project_progress_ratio = var:my_var }",
    },
    {
        key: "complete_prototype_reward_option",
        label: "prototype_reward = <prototype_reward> The protypereward to compete prototyp_rewa",
        scope: "complete_prototype_reward_option = { prototype_reward = my_reward prototyp_reward_option = my_option show_modifiers = yes }",
    },
    {
        key: "set_project_flag",
        label: "<flag> An unique string to identify the project flag with. OR flag = <flag> The ",
        scope: "set_project_flag = my_flag set_project_flag = { flag = my_flag days = 123 value = 1 }",
    },
    {
        key: "clr_project_flag",
        label: "<flag> The unique string of a country flag to clear.",
        scope: "clr_project_flag = my_flag",
    },
    {
        key: "modify_project_flag",
        label: "flag = <flag> The flag to modify. value = <value> The value to add to the flag. ",
        scope: "modify_mproject_flag = { flag = my_flag value = 3 }",
    },
    {
        key: "execute_operation_coordinated_strike",
        label: "amount = <int> How many times the operation will get executed within the days se",
        scope: "execute_operation_coordinated_strike = { amount = 12 }",
    },
    {
        key: "instantiate_collaboration_government",
        label: "Country",
        scope: "instantiate_collaboration_government = yes",
    },
    {
        key: "add_potential_special_forces_tree",
        label: "Country",
        scope: "add_potential_special_forces_tree = yes",
    },
    {
        key: "upgrade_economy_law",
        label: "Country",
        scope: "upgrade_economy_law = yes",
    },
    {
        key: "gain_random_agency_upgrade",
        label: "Country",
        scope: "gain_random_agency_upgrade = yes",
    },
    {
        key: "add_ruling_to_dem",
        label: "Country",
        scope: "add_ruling_to_dem = yes",
    },
    {
        key: "remove_any_country_role_from_character",
        label: "Character",
        scope: "remove_any_country_role_from_character = yes",
    },
    {
        key: "increase_state_category",
        label: "State",
        scope: "increase_state_category = yes",
    },
    {
        key: "lerp",
        label: "Any",
        scope: "lerp = yes",
        params: [{"name": "...", "type": "scope_block"}],
    },
    {
        key: "store_core_states_on_game_start",
        label: "Country",
        scope: "store_core_states_on_game_start = yes",
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
        label: "<date> The date to check for.",
        scope: "has_start_date > 1950.01.01",
    },
    {
        key: "difficulty",
        label: "<int> The difficulty value.",
        scope: "difficulty > 0",
    },
    {
        key: "has_any_custom_difficulty_setting",
        label: "<bool> Boolean.",
        scope: "has_any_custom_difficulty_setting = yes",
    },
    {
        key: "has_custom_difficulty_setting",
        label: "<string> The setting to check.",
        scope: "has_custom_difficulty_setting = custom_diff_strong_sov",
    },
    {
        key: "game_rules_allow_achievements",
        label: "<bool> Boolean.",
        scope: "game_rules_allow_achievements = yes",
    },
    {
        key: "country_exists",
        label: "<scope> / <variable> The country to check.",
        scope: "country_exists = GER",
    },
    {
        key: "is_ironman",
        label: "<bool> Boolean.",
        scope: "is_ironman = yes",
    },
    {
        key: "is_historical_focus_on",
        label: "<bool> Boolean.",
        scope: "is_historical_focus_on = yes",
    },
    {
        key: "is_tutorial",
        label: "<bool> Boolean.",
        scope: "is_tutorial = yes",
    },
    {
        key: "is_debug",
        label: "<bool> Boolean.",
        scope: "is_debug = yes",
    },
    {
        key: "threat",
        label: "<float> The amount to check for.",
        scope: "threat > 0.5",
    },
    {
        key: "has_game_rule",
        label: "<string> The game rule to check for. <string> / <bool> The option to check.",
        scope: "has_game_rule = { rule = GER_can_remilitarize_rhineland option = yes }",
    },
    {
        key: "has_completed_custom_achievement",
        label: "mod = <mod ID> The mod where the achievement is from. achievement = <achievement",
        scope: "has_completed_custom_achievement = { mod = my_mod_unique_id achievement = my_achievement_token }",
    },
    {
        key: "career_profile_check_medal",
        label: "medal = <medal> Medal to check. ???",
        scope: "career_profile_check_medal = { medal = raining_debris_medal ??? }",
    },
    {
        key: "career_profile_check_ribbon",
        label: "ribbon = <ribbon> Ribbon to check. tooltip = <loc_key> Optional.",
        scope: "career_profile_check_ribbon = { ribbon = orchestra_of_boom tooltip = my_loc_key }",
    },
    {
        key: "career_profile_check_playthrough_ratio",
        label: "frits = <variable> second = <variable> ratio = <int> Ratio. compare = <type> The",
        scope: "career_profile_check_playthrough_ratio = { first = enemy_casualties second = total_own_casualties ratio = 4 compare = greater_than_or_equals }",
    },
    {
        key: "career_profile_check_playthrough_value",
        label: "{ ... } OR var = <variable> Value to compare. value = <int> Value to compare to.",
        scope: "career_profile_check_playthrough_value = { plan_landlocked_battleship > 1 plan_landlocked_carrier > 0 } career_profile_check_playthrough_value = { var = deployed_airplanes_with_air_defense_gold value = 100 compare = greater_than_or_equals tooltip = CAREER_PROFILE_TRIGGER_DEPLOYED_AIRPLANES_WITH_AIR_DEFENSE tooltip_value = 100",
    },
    {
        key: "career_profile_check_points",
        label: "value = <int> Value to compare. compare = <type> The type of comparison. tooltip",
        scope: "career_profile_check_points = { value = 5000 compare = greater_than_or_equals tooltip = CAREER_PROFILE_TRIGGER_MINED_SEA_REGIONS }",
    },
    {
        key: "career_profile_check_ratio",
        label: "Possible the same as #career_profile_check_playthrough_ratio .",
        scope: "Possible the same as #career_profile_check_playthrough_ratio .",
    },
    {
        key: "career_profile_check_value",
        label: "Possible the same as #career_profile_check_playthrough_value .",
        scope: "Possible the same as #career_profile_check_playthrough_value .",
    },
    {
        key: "career_profile_has_player_flag",
        label: "<string> The flag to check.",
        scope: "career_profile_has_player_flag = career_profile_overrun_infantry_flag",
    },
    {
        key: "print_variables",
        label: "print_global = <bool> Print global variables. Defaults to no . var_list = <list>",
        scope: "print_variables = { var_list = { myvar1 myvar2 } file = \"my_dump_file\" text = \"my header\" }",
    },
    {
        key: "exists",
        label: "<bool> Boolean.",
        scope: "exists = yes",
    },
    {
        key: "is_ai",
        label: "<bool> Boolean.",
        scope: "is_ai = yes",
    },
    {
        key: "has_collaboration",
        label: "target = <country> The country to check. value <> <decimal> The value of the col",
        scope: "has_collaboration = { target = GER value > 0.5 }",
    },
    {
        key: "has_cosmetic_tag",
        label: "<string> The cosmetic tag to check.",
        scope: "has_cosmetic_tag = SOV_custom",
    },
    {
        key: "has_event_target",
        label: "<event target> The event target to check.",
        scope: "has_event_target = my_var",
    },
    {
        key: "has_decision",
        label: "<string> The decision to check.",
        scope: "has_decision = my_decision",
    },
    {
        key: "has_dynamic_modifier",
        label: "modifier = <string> The dynamic_modifier to check. scope = <scope> The country t",
        scope: "has_dynamic_modifier = { modifier = my_dynamic_modifier scope = GER }",
    },
    {
        key: "has_active_mission",
        label: "<string> The mission to check.",
        scope: "has_active_mission = my_mission",
    },
    {
        key: "has_country_custom_difficulty_setting",
        label: "<bool> Boolean.",
        scope: "has_country_custom_difficulty_setting = yes",
    },
    {
        key: "has_terrain",
        label: "<terrain> Terrain.",
        scope: "has_terrain = urban",
    },
    {
        key: "is_dynamic_country",
        label: "<bool> Boolean.",
        scope: "is_dynamic_country = yes",
    },
    {
        key: "num_of_supply_nodes",
        label: "<int> The amount to check for.",
        scope: "num_of_supply_nodes > 10",
    },
    {
        key: "has_resources_in_country",
        label: "resource = <resource> The resource to check for. amount = <int> The amount to ch",
        scope: "has_resources_in_country = { resource = oil amount > 10 extracted = yes }",
    },
    {
        key: "has_focus_tree",
        label: "<string> The focus tree to check.",
        scope: "has_focus_tree = soviet_tree",
    },
    {
        key: "focus_progress",
        label: "focus = <string> The focus to check. progress = <string> The progress to check f",
        scope: "focus_progress = { focus = my_focus progress > 0.5 }",
    },
    {
        key: "has_shine_effect_on_focus",
        label: "<string> The focus to check.",
        scope: "has_shine_effect_on_focus = GER_wunderwaffe",
    },
    {
        key: "political_power_growth",
        label: "<float> / <variable> The amount to check for.",
        scope: "political_power_growth > 1",
    },
    {
        key: "command_power",
        label: "<float> / <variable> The amount to check for.",
        scope: "command_power > 1",
    },
    {
        key: "command_power_daily",
        label: "<float> / <variable> The amount to check for.",
        scope: "command_power_daily > 1",
    },
    {
        key: "has_elections",
        label: "<bool> Boolean.",
        scope: "has_elections = yes",
    },
    {
        key: "is_staging_coup",
        label: "<bool> Boolean.",
        scope: "is_staging_coup = yes",
    },
    {
        key: "is_target_of_coup",
        label: "<bool> Boolean.",
        scope: "is_target_of_coup = yes",
    },
    {
        key: "has_civil_war",
        label: "<bool> Boolean.",
        scope: "has_civil_war = yes",
    },
    {
        key: "civilwar_target",
        label: "<scope> The target country.",
        scope: "civilwar_target = GER",
    },
    {
        key: "has_manpower_for_recruit_change_to",
        label: "value = <float> The amount to check for. group = <group> The group to check for.",
        scope: "has_manpower_for_recruit_change_to = { value > 0.05 group = mobilization_laws }",
    },
    {
        key: "has_rule",
        label: "<string> The rule to check for.",
        scope: "has_rule = can_create_factions",
    },
    {
        key: "has_casualties_war_support",
        label: "<float> / <variable> The amount to check for.",
        scope: "has_casualties_war_support < 0",
    },
    {
        key: "has_convoys_war_support",
        label: "<float> / <variable> The amount to check for.",
        scope: "has_convoys_war_support < 0",
    },
    {
        key: "has_bombing_war_support",
        label: "<float> / <variable> The amount to check for.",
        scope: "has_bombing_war_support < 0",
    },
    {
        key: "has_power_balance",
        label: "id = <bop ID> The balance to check for.",
        scope: "has_power_balance = { id = TAG_my_bop }",
    },
    {
        key: "has_any_power_balance",
        label: "<bool> Boolean.",
        scope: "has_any_power_balance = yes",
    },
    {
        key: "power_balance_value",
        label: "id = <bop ID> The balance to check in. value = <float> The value to check for.",
        scope: "power_balance_value = { id = TAG_my_bop value > 0.7 }",
    },
    {
        key: "power_balance_daily_change",
        label: "id = <bop ID> The balance to check in. value = <float> The value to check for.",
        scope: "power_balance_daily_change = { id = TAG_my_bop value < -0.01 }",
    },
    {
        key: "power_balance_weekly_change",
        label: "id = <bop ID> The balance to check in. value = <float> The value to check for.",
        scope: "power_balance_weekly_change = { id = TAG_my_bop value < -0.01 }",
    },
    {
        key: "is_power_balance_in_range",
        label: "id = <bop ID> The balance to check in. range = <range ID> The range to check for",
        scope: "is_power_balance_in_range = { id = TAG_my_bop range > TAG_my_bop_right_range }",
    },
    {
        key: "is_power_balance_side_active",
        label: "id = <bop ID> The balance to check in. side = <side ID> The side to check.",
        scope: "is_power_balance_side_active = { id = TAG_my_bop side = TAG_my_bop_right_range }",
    },
    {
        key: "has_power_balance_modifier",
        label: "id = <bop ID> The balance to check in. modifier = <modifier ID> The static modif",
        scope: "has_power_balance_modifier = { id = TAG_my_bop modifier = TAG_my_bop_modifier }",
    },
    {
        key: "num_of_naval_factories",
        label: "<int> The amount to check for.",
        scope: "num_of_naval_factories > 10",
    },
    {
        key: "num_of_available_military_factories",
        label: "<int> The amount to check for.",
        scope: "num_of_available_military_factories > 10",
    },
    {
        key: "num_of_available_civilian_factories",
        label: "<int> The amount to check for.",
        scope: "num_of_available_civilian_factories > 10",
    },
    {
        key: "num_of_available_naval_factories",
        label: "<int> The amount to check for.",
        scope: "num_of_available_naval_factories > 10",
    },
    {
        key: "num_of_controlled_factories",
        label: "<int> The amount to check for.",
        scope: "num_of_controlled_factories > 10",
    },
    {
        key: "num_of_owned_factories",
        label: "<int> The amount to check for.",
        scope: "num_of_owned_factories > 10",
    },
    {
        key: "num_of_civilian_factories_available_for_projects",
        label: "<int> The amount to check for.",
        scope: "num_of_civilian_factories_available_for_projects > 10",
    },
    {
        key: "ic_ratio",
        label: "tag = <scope> The country to check. ratio = <float> The ratio to check for.",
        scope: "ic_ratio = { tag = GER ratio > 0.5 }",
    },
    {
        key: "has_damaged_buildings",
        label: "<bool> Boolean.",
        scope: "has_damaged_buildings = yes",
    },
    {
        key: "has_built",
        label: "type = <building> The building to check for. value = <int> The amount to check f",
        scope: "has_built = { type = arms_factory value > 10 }",
    },
    {
        key: "is_researching_technology",
        label: "<string> The technology to check for.",
        scope: "is_researching_technology = my_tech",
    },
    {
        key: "can_research",
        label: "<string> The technology to check for.",
        scope: "can_research = my_tech",
    },
    {
        key: "original_research_slots",
        label: "<int> The amount to check for.",
        scope: "original_research_slots > 3",
    },
    {
        key: "amount_research_slots",
        label: "<int> The amount to check for.",
        scope: "amount_research_slots > 3",
    },
    {
        key: "is_in_tech_sharing_group",
        label: "<string> The group to check for.",
        scope: "is_in_tech_sharing_group = us_research",
    },
    {
        key: "num_tech_sharing_groups",
        label: "<int> The amount to check for.",
        scope: "num_tech_sharing_groups > 3",
    },
    {
        key: "has_tech_bonus",
        label: "technology = <string> The technology to check for. Optional. category = <string>",
        scope: "has_tech_bonus = { technology = my_tech } has_tech_bonus = { category = my_category }",
    },
    {
        key: "land_doctrine_level",
        label: "<int> The amount to check for.",
        scope: "land_doctrine_level > 2",
    },
    {
        key: "num_researched_technologies",
        label: "<int> The amount to check for.",
        scope: "num_researched_technologies > 10",
    },
    {
        key: "is_special_project_being_researched",
        label: "sp:<string> A special project to check for.",
        scope: "is_special_project_being_researched = sp:sp_air_radar",
    },
    {
        key: "is_special_project_completed",
        label: "sp:<string> A special project to check for.",
        scope: "is_special_project_completed = sp:sp_land_flamethrower_tank",
    },
    {
        key: "has_idea_with_trait",
        label: "<string> The trait to check for.",
        scope: "has_idea_with_trait = my_trait",
    },
    {
        key: "has_allowed_idea_with_traits",
        label: "idea = <string> The trait to check for. limit = <int> The amount to check for. c",
        scope: "has_available_idea_with_traits = { idea = my_trait limit = 1 ignore = { generic_head_of_intelligence } }",
    },
    {
        key: "has_available_idea_with_traits",
        label: "idea = <string> The trait to check for. limit = <int> The amount to check for. c",
        scope: "has_available_idea_with_traits = { idea = my_trait limit = 1 ignore = { generic_head_of_intelligence } }",
    },
    {
        key: "amount_taken_ideas",
        label: "amount = <int> The amount to check for. slots = { <string> } The slot type.",
        scope: "amount_taken_ideas = { amount > 3 slots = { political_advisor } }",
    },
    {
        key: "is_ally_with",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_ally_with = GER is_ally_with = var:country",
    },
    {
        key: "is_spymaster",
        label: "<bool> Boolean.",
        scope: "is_spymaster = yes",
    },
    {
        key: "has_non_aggression_pact_with",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_non_aggression_pact_with = GER",
    },
    {
        key: "is_guaranteed_by",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_guaranteed_by = GER",
    },
    {
        key: "has_guaranteed",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_guaranteed = GER",
    },
    {
        key: "has_military_access_to",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_military_access_to = GER",
    },
    {
        key: "gives_military_access_to",
        label: "<scope> / <variable> The country to check for.",
        scope: "gives_military_access_to = GER",
    },
    {
        key: "is_owner_neighbor_of",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_owner_neighbor_of = GER",
    },
    {
        key: "is_puppet_of",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_puppet_of = GER",
    },
    {
        key: "is_subject_of",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_subject_of = GER",
    },
    {
        key: "has_subject",
        label: "<bool> Boolean.",
        scope: "has_subject = GRE",
    },
    {
        key: "num_subjects",
        label: "<int> The amount to check for.",
        scope: "num_subjects > 3",
    },
    {
        key: "has_autonomy_state",
        label: "<string> The autonomy state to check for.",
        scope: "has_autonomy_state = autonomy_dominion",
    },
    {
        key: "compare_autonomy_state",
        label: "<string> The autonomy state to check for.",
        scope: "compare_autonomy_state > autonomy_dominion",
        params: [{"name": "value", "type": "string"}],
    },
    {
        key: "compare_autonomy_progress_ratio",
        label: "<float> The amount to check for.",
        scope: "compare_autonomy_progress_ratio > 0.5",
    },
    {
        key: "has_opinion_modifier",
        label: "<string> The opinion modifier to check for.",
        scope: "has_opinion_modifier = my_modifier",
    },
    {
        key: "has_relation_modifier",
        label: "target = <scope> The country to check for. modifier = <modifier> The modifier to",
        scope: "has_relation_modifier = { target = GER modifier = my_modifier }",
    },
    {
        key: "has_legitimacy",
        label: "<int> Amount to check.",
        scope: "has_legitimacy > 50",
    },
    {
        key: "is_exile_host",
        label: "<bool> Boolean.",
        scope: "is_exile_host = yes",
    },
    {
        key: "is_hosting_exile",
        label: "<tag> Country.",
        scope: "is_hosting_exile = POL",
    },
    {
        key: "is_government_in_exile",
        label: "<bool> Boolean.",
        scope: "is_government_in_exile = yes",
    },
    {
        key: "is_exiled_in",
        label: "<tag> Country to be exiled in.",
        scope: "is_exiled_in = POL",
    },
    {
        key: "received_expeditionary_forces",
        label: "sender = <tag> Country which sent forces. value <> <int> Amount of forces.",
        scope: "received_expeditionary_forces = { sender = POL value > 10 }",
    },
    {
        key: "can_declare_war_on",
        label: "<tag> Country to check.",
        scope: "can_declare_war_on = POL",
    },
    {
        key: "foreign_manpower",
        label: "<int> Amount to check.",
        scope: "foreign_manpower > 10000",
    },
    {
        key: "is_embargoed_by",
        label: "<scope> Amount to check.",
        scope: "is_embargoed_by = USA",
    },
    {
        key: "is_embargoing",
        label: "<scope> Amount to check.",
        scope: "is_embargoing = CUB",
    },
    {
        key: "num_faction_members",
        label: "<int> / <variable> The amount to check for.",
        scope: "num_faction_members > 1",
    },
    {
        key: "has_manpower_to_become_leader",
        label: "<bool> Boolean",
        scope: "has_manpower_to_become_leader = yes",
    },
    {
        key: "has_industry_to_become_leader",
        label: "<bool> Boolean",
        scope: "has_industry_to_become_leader = yes",
    },
    {
        key: "has_enough_influence_for_leadership",
        label: "<bool> Boolean",
        scope: "has_enough_influence_for_leadership = yes",
    },
    {
        key: "has_faction_template",
        label: "<template_id> Faction template id.",
        scope: "has_faction_template = faction_template_chinese_united_front",
    },
    {
        key: "has_active_rule",
        label: "<rule_id> Faction rule id.",
        scope: "has_active_rule = government_in_exile_allowed",
    },
    {
        key: "has_faction_goal",
        label: "<goal_id> Faction goal id.",
        scope: "has_faction_goal = faction_goal_resource_control",
    },
    {
        key: "has_completed_faction_goal",
        label: "<goal_id> Faction goal id.",
        scope: "has_completed_faction_goal = faction_goal_resource_control",
    },
    {
        key: "faction_goal_fulfillment",
        label: "goal = <goal_id> Faction goal id. value = <float> / <variable> The amount to che",
        scope: "faction_goal_fulfillment = { goal = faction_goal_resource_control value > 0.85 } faction_goal_fulfillment = { goal = faction_goal_resource_control value > 0.5 value < 0.85 }",
    },
    {
        key: "faction_manifest_fulfillment",
        label: "<float> / <variable> The amount to check for.",
        scope: "faction_manifest_fulfillment > 0.95",
    },
    {
        key: "faction_upgrade_level",
        label: "<upgrade_token> Faction upgrade token.",
        scope: "faction_upgrade_level > upgrade_token",
    },
    {
        key: "faction_power_projection",
        label: "<int> / <variable> The amount to check for.",
        scope: "faction_power_projection > 100",
    },
    {
        key: "faction_influence_rank",
        label: "<int> / <variable> The amount to check for.",
        scope: "faction_influence_rank < 5",
    },
    {
        key: "faction_influence_ratio",
        label: "<float> / <variable> The amount to check for.",
        scope: "faction_influence_ratio > 0.1",
    },
    {
        key: "faction_influence_score",
        label: "<int> / <variable> The amount to check for.",
        scope: "faction_influence_score > 100",
    },
    {
        key: "can_assign_supportive_scientist_to_faction",
        label: "<specialization> Specialization.",
        scope: "can_assign_supportive_scientist_to_faction = specialization_land",
    },
    {
        key: "has_faction_research_unlocked",
        label: "<bool> Boolean.",
        scope: "has_faction_research_unlocked = yes",
    },
    {
        key: "has_faction_military_unlocked",
        label: "<bool> Boolean.",
        scope: "has_faction_military_unlocked = yes",
    },
    {
        key: "compare_ideology_with_faction",
        label: "value = <float> / <variable> The amount to check for. leader = <tag> Country to ",
        scope: "compare_ideology_with_faction = { value > 0.5 leader = FROM }",
    },
    {
        key: "has_war_with",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_war_with = GER has_war_with = var:country",
    },
    {
        key: "has_offensive_war_with",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_offensive_war_with = GER",
    },
    {
        key: "has_offensive_war_without_friend",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_offensive_war_without_friend = GER",
    },
    {
        key: "has_defensive_war_with",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_defensive_war_with = GER",
    },
    {
        key: "has_offensive_war",
        label: "<bool> Boolean.",
        scope: "has_offensive_war = yes",
    },
    {
        key: "has_defensive_war",
        label: "<bool> Boolean.",
        scope: "has_defensive_war = yes",
    },
    {
        key: "has_war_together_with",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_war_together_with = GER",
    },
    {
        key: "has_war_with_major",
        label: "<bool> Boolean.",
        scope: "has_war_with_major = yes",
    },
    {
        key: "has_war_with_wargoal_against",
        label: "target = <scope> / <variable> The country to check for. type = <wargoal> The war",
        scope: "has_war_with_wargoal_against = { target = ENG type = independence_wargoal }",
    },
    {
        key: "surrender_progress",
        label: "<float> / <variable> The amount to check for.",
        scope: "surrender_progress > 0.1",
    },
    {
        key: "has_capitulated",
        label: "<bool> Boolean.",
        scope: "has_capitulated = yes",
    },
    {
        key: "days_since_capitulated",
        label: "<int> Amount of days.",
        scope: "days_since_capitulated > 10",
    },
    {
        key: "has_border_war_with",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_border_war_with = GER",
    },
    {
        key: "has_border_war_between",
        label: "attacker = <scope> / <variable> The state to check for. defender = <scope> / <va",
        scope: "has_border_war_between = { attacker = 1 defender = 2 }",
    },
    {
        key: "has_border_war",
        label: "<bool> Boolean.",
        scope: "has_border_war = yes",
    },
    {
        key: "has_added_tension_amount",
        label: "<float> / <variable> The amount to check for.",
        scope: "has_added_tension_amount > 10",
    },
    {
        key: "has_wargoal_against",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_wargoal_against = GER",
    },
    {
        key: "is_justifying_wargoal_against",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_justifying_wargoal_against = GER",
    },
    {
        key: "has_annex_war_goal",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_annex_war_goal = GER",
    },
    {
        key: "controls_province",
        label: "<id> The province to check for.",
        scope: "controls_province = 1239",
    },
    {
        key: "longest_war_length",
        label: "<int> Amount of months.",
        scope: "longest_war_length > 3",
    },
    {
        key: "war_length_with",
        label: "tag = <scope> / <variable> Target country. months = <int> Amounth of months.",
        scope: "war_length_with = { tag = GER months > 3 }",
    },
    {
        key: "has_truce_with",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_truce_with = GER",
    },
    {
        key: "has_naval_control",
        label: "<id> / <variable> The region to check in.",
        scope: "has_naval_control = 16",
    },
    {
        key: "has_enemy_naval_control",
        label: "<id> / <variable> The region to check in.",
        scope: "has_enemy_naval_control = 16",
    },
    {
        key: "num_of_controlled_states",
        label: "<int> The amount to check for.",
        scope: "num_of_controlled_states > 5",
    },
    {
        key: "num_occupied_states",
        label: "<int> The amount to check for.",
        scope: "num_occupied_states > 5",
    },
    {
        key: "has_resources_rights",
        label: "state = <scope> / <variable> The state to check in. Mandatory if used in country",
        scope: "has_resources_rights = { state = 123 resources = { oil steel } }",
    },
    {
        key: "core_compliance",
        label: "occupied_country_tag = <TAG> The country for which to check compliance. value = ",
        scope: "core_compliance = { occupied_country_tag = ITA value > 10 }",
    },
    {
        key: "core_resistance",
        label: "occupied_country_tag = <TAG> The country for which to check resistance. value = ",
        scope: "core_resistance = { occupied_country_tag = ITA value > 10 }",
    },
    {
        key: "garrison_manpower_need",
        label: "<int> Amount to check.",
        scope: "garrison_manpower_need > 10000",
    },
    {
        key: "has_core_occupation_modifier",
        label: "occupied_country_tag = <scope> / <variable> The country to check. modifier = <to",
        scope: "has_core_occupation_modifier = { occupied_country_tag = ITA modifier = token }",
    },
    {
        key: "occupation_law",
        label: "<law ID> The law to check.",
        scope: "POL = { POL = { occupation_law = foreign_civilian_oversight } } # Checks POL's default occupation law HOL = { BEL = { occupation_law = foreign_civilian_oversight } } # Checks HOL's occupation law over BEL",
    },
    {
        key: "has_contested_owner",
        label: "<state> / <variable> State to check.",
        scope: "has_contested_owner = 42",
    },
    {
        key: "owns_any_state_of",
        label: "<states> States to check.",
        scope: "owns_any_state_of = { 123 246 }",
    },
    {
        key: "is_on_same_continent_as",
        label: "<scope> / <variable> The state to check for.",
        scope: "is_on_same_continent_as = 111",
    },
    {
        key: "has_army_experience",
        label: "<float> / <variable> The amount to check for.",
        scope: "has_army_experience > 10 has_army_experience > var:number",
    },
    {
        key: "has_air_experience",
        label: "<float> / <variable> The amount to check for.",
        scope: "has_air_experience > 10",
    },
    {
        key: "has_navy_experience",
        label: "<float> / <variable> The amount to check for.",
        scope: "has_navy_experience < 10",
    },
    {
        key: "has_army_manpower",
        label: "size = <int> The amount to check for.",
        scope: "has_army_manpower = { size > 1000 }",
    },
    {
        key: "manpower_per_military_factory",
        label: "<float> The amount to check for.",
        scope: "manpower_per_military_factory > 1000",
    },
    {
        key: "conscription_ratio",
        label: "<float> / <variable> The ratio to compare with.",
        scope: "conscription_ratio < 0.2",
    },
    {
        key: "current_conscription_amount",
        label: "<float> / <variable> The amount to compare with.",
        scope: "current_conscription_amount > 2000",
    },
    {
        key: "target_conscription_amount",
        label: "<float> / <variable> The amount to compare with.",
        scope: "target_conscription_amount > 2000",
    },
    {
        key: "num_divisions",
        label: "<int> The amount to check for.",
        scope: "num_divisions > 5",
    },
    {
        key: "num_of_nukes",
        label: "<int> The amount to check for.",
        scope: "num_of_nukes > 5",
    },
    {
        key: "casualties",
        label: "<int> The amount to check for.",
        scope: "casualties > 10000",
    },
    {
        key: "casualties_k",
        label: "<int> The amount to check for.",
        scope: "casualties_k > 10",
    },
    {
        key: "casualties_inflicted_by",
        label: "opponent = <tag> The tag that inflicted the casualties. thousands <> <int> The a",
        scope: "casualties_inflicted_by = { opponent = POL thousands > 10 }",
    },
    {
        key: "amount_manpower_in_deployment_queue",
        label: "<float> The amount to check for.",
        scope: "amount_manpower_in_deployment_queue > 1000",
    },
    {
        key: "has_attache_from",
        label: "<scope> / <variable> The country to check for.",
        scope: "has_attache_from = GER",
    },
    {
        key: "has_attache",
        label: "<bool> Boolean.",
        scope: "has_attache = yes",
    },
    {
        key: "is_lend_leasing",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_lend_leasing = GER",
    },
    {
        key: "has_template",
        label: "<string> The name of the template.",
        scope: "has_template = \"Infantry Division\"",
    },
    {
        key: "has_template_majority_unit",
        label: "<string> The unit to check for.",
        scope: "has_template_majority_unit = infantry",
    },
    {
        key: "has_template_containing_unit",
        label: "<string> The name of the unit.",
        scope: "has_template_containing_unit = light_armor",
    },
    {
        key: "fighting_army_strength_ratio",
        label: "tag = <scope> The country to check for. ratio <>= <float> / <variable> The ratio",
        scope: "fighting_army_strength_ratio = { tag = GER ratio > 0.7 }",
    },
    {
        key: "naval_strength_ratio",
        label: "tag = <scope> The country to check for. ratio <> <float> The ratio to check for.",
        scope: "naval_strength_ratio = { tag = GER ratio <> 1 }",
    },
    {
        key: "naval_strength_comparison",
        label: "other = <scope> The country to check for. tooltip = <string> The ratio to check ",
        scope: "naval_strength_comparison = { other = POL tooltip = my_loc_key_tt ratio > 1 sub_unit_def_weights = { carrier = 1 submarine = 2 } }",
    },
    {
        key: "alliance_naval_strength_ratio",
        label: "<float> / <variable> The ratio to check for.",
        scope: "alliance_naval_strength_ratio > 0.5",
    },
    {
        key: "enemies_strength_ratio",
        label: "<float> / <variable> The ratio to check for.",
        scope: "enemies_strength_ratio > 0.5",
    },
    {
        key: "enemies_naval_strength_ratio",
        label: "<float> / <variable> The ratio to check for.",
        scope: "enemies_naval_strength_ratio > 0.5",
    },
    {
        key: "has_navy_size",
        label: "size = <float> / <variable> The amount to check for. type = <string> The type to",
        scope: "has_navy_size = { size > 10 type = capital_ship archetype = ship_hull_heavy }",
    },
    {
        key: "has_deployed_air_force_size",
        label: "size = <float> The amount to check for. type = <string> The type to check for. O",
        scope: "has_deployed_air_force_size = { size > 10 type = cas }",
    },
    {
        key: "divisions_in_state",
        label: "size = <float> The amount to check for. type = <string> The battalion type to ch",
        scope: "divisions_in_state = { type = armor size > 10 state = 49 }",
    },
    {
        key: "army_manpower_in_state",
        label: "amount <> <float> The amount to check for. type = <string> The type to check for",
        scope: "army_manpower_in_state = { type = support amount > 10000 state = 49 }",
    },
    {
        key: "divisions_in_border_state",
        label: "size = <float> The amount to check for. type = <string> The battalion type to ch",
        scope: "divisions_in_border_state = { type = infantry size > 10 state = 49 border_state = var:state }",
    },
    {
        key: "num_divisions_in_states",
        label: "count = <int> The amount to check for. states = { <int> <...> <int> } The states",
        scope: "num_divisions_in_states = { count > 24 states = { 550 559 271 } exclude = { irregular_infantry } }",
    },
    {
        key: "num_battalions_in_states",
        label: "count = <int> The amount to check for. states = { <int> <...> <int> } The states",
        scope: "num_battalions_in_states = { count > 24 states = { 550 559 271 } exclude = { irregular_infantry } }",
    },
    {
        key: "ships_in_state_ports",
        label: "size = <float> The amount to check for. type = <string> The type to check for. O",
        scope: "ships_in_state_ports = { type = capital_ship size > 10 state = 49 }",
    },
    {
        key: "num_planes_stationed_in_regions",
        label: "value = <float> The amount to check for. regions = { <id> <...> <id> } The regio",
        scope: "num_planes_stationed_in_regions = { value > 10 regions = { 123 321 } }",
    },
    {
        key: "has_volunteers_amount_from",
        label: "tag = <scope> The country to check for. count = <int> The amount to check for.",
        scope: "has_volunteers_amount_from = { tag = GER count > 10 }",
    },
    {
        key: "convoy_threat",
        label: "<float> The threat to compate with.",
        scope: "convoy_threat > 0.5",
    },
    {
        key: "has_mined",
        label: "target = <tag> The country the coast of which is mined. value <> <int> The amoun",
        scope: "has_mined = { target = POL value > 1000 }",
    },
    {
        key: "has_mines",
        label: "region = <ID> The strategic region that contains the mines. amount = <int> The a",
        scope: "has_mined = { target = POL amount = 1000 }",
    },
    {
        key: "mine_threat",
        label: "<float> The threat to compate with.",
        scope: "mine_threat < 0.6",
    },
    {
        key: "has_military_industrial_organization",
        label: "<token> The id to check for.",
        scope: "has_military_industrial_organization = infantry_mio_token",
    },
    {
        key: "has_tactic",
        label: "<tactic> The tactic to check for.",
        scope: "has_tactic = tactic_masterful_blitz",
    },
    {
        key: "has_any_grand_doctrine",
        label: "<string> Doctrine folder.",
        scope: "has_any_grand_doctrine = land",
    },
    {
        key: "has_doctrine",
        label: "<grand doctrine> / <subdoctrine> The doctrine to check for.",
        scope: "has_doctrine = mobile_warfare # Grand doctrine has_doctrine = mobile_infantry # Subdoctrine",
    },
    {
        key: "has_subdoctrine_in_track",
        label: "<track> The track to check for.",
        scope: "has_subdoctrine_in_track = infantry",
    },
    {
        key: "has_completed_subdoctrine",
        label: "<subdoctrine> The subdoctrine to check for.",
        scope: "has_completed_subdoctrine = mobile_infantry",
    },
    {
        key: "has_completed_track",
        label: "<track> The track to check for.",
        scope: "has_completed_track = infantry",
    },
    {
        key: "has_mastery",
        label: "amount = <int> The amout to check for. track = <track> The track to check for.",
        scope: "has_mastery = { amount = 200 track = infantry }",
    },
    {
        key: "has_mastery_level",
        label: "amount = <int> The amount to check for. subdoctrine = <subdoctrine> The subdoctr",
        scope: "has_mastery_level = { amount = 2 subdoctrine = mobile_infantry }",
    },
    {
        key: "stockpile_ratio",
        label: "archetype = <string> The equipment archetype to check for. ratio = <float> The r",
        scope: "stockpile_ratio = { archetype = infantry_equipment ratio > 0.5 }",
    },
    {
        key: "has_equipment",
        label: "<equipment> = <int> / <variable> The equipment to check for, and the amount to c",
        scope: "has_equipment = { infantry_equipment_1 > 10 }",
    },
    {
        key: "has_any_license",
        label: "<bool> Boolean.",
        scope: "has_any_license = yes",
    },
    {
        key: "is_licensing_any_to",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_licensing_any_to = GER",
    },
    {
        key: "is_licensing_to",
        label: "target = <scope> The country to check for. archetype = <string> The equipment ar",
        scope: "is_licensing_to = { target = GER archetype = infantry_equipment } is_licensing_to = { target = GER equipment = { type = light_tank_equipment version = 1 } }",
    },
    {
        key: "has_license",
        label: "from = <scope> The country to check for. archetype = <string> The equipment arch",
        scope: "has_license = { from = GER archetype = infantry_equipment } has_license = { from = GER equipment = { type = light_tank_equipment version = 1 } }",
    },
    {
        key: "fuel_ratio",
        label: "<float> / <variable> The ratio to check with.",
        scope: "fuel_ratio > 0.4",
    },
    {
        key: "has_fuel",
        label: "<int> / <variable> The amount to compare with.",
        scope: "has_fuel > 400",
    },
    {
        key: "has_design_based_on",
        label: "<archetype> The equipment archetype.",
        scope: "has_design_based_on = light_tank_chassis",
    },
    {
        key: "estimated_intel_max_piercing",
        label: "tag = <scope> The country to check for. value = <int> The amount to check for.",
        scope: "estimated_intel_max_piercing = { tag = GER value > 2 }",
    },
    {
        key: "estimated_intel_max_armor",
        label: "tag = <scope> The country to check for. value = <int> The amount to check for.",
        scope: "estimated_intel_max_armor = { tag = GER value > 2 }",
    },
    {
        key: "compare_intel_with",
        label: "target = <tag> / <variable> The target to compare with. civilian_intel <>= <floa",
        scope: "compare_intel_with = { target = POL civilian_intel > 0.5 army_intel = 0 navy_intel < 0 }",
    },
    {
        key: "intel_level_over",
        label: "target = <tag> / <variable> The target to compare with. civilian_intel <>= <floa",
        scope: "intel_level_over = { target = POL civilian_intel > 0.5 army_intel = 0 navy_intel < 0 }",
    },
    {
        key: "has_intelligence_agency",
        label: "<boolean> The intelligence agency to check.",
        scope: "has_intelligence_agency = yes",
    },
    {
        key: "network_national_coverage",
        label: "target = <tag> / <variable> The country which is checked. value <> <float> / <va",
        scope: "network_national_coverage = { target = POL value < 70 }",
    },
    {
        key: "network_strength",
        label: "target = <tag> The country which is checked. state = <id> / <variable> The state",
        scope: "network_strength = { target = POL value < 70 }",
    },
    {
        key: "has_done_agency_upgrade",
        label: "<string> The agency upgrade to check.",
        scope: "has_done_agency_upgrade = upgrade_army_department",
    },
    {
        key: "agency_upgrade_number",
        label: "<int> / <variable> The amount of agency upgrades to check for.",
        scope: "agency_upgrade_number > 4",
    },
    {
        key: "decryption_progress",
        label: "target = <tag> The country to compare with. value <> <float> The value to compar",
        scope: "decryption_progress = { target = POL value < 0.5 }",
    },
    {
        key: "has_captured_operative",
        label: "<tag>/<bool> Country whose operative was captured/Whether an operative was captu",
        scope: "has_captured_operative = POL has_captured_operative = yes",
    },
    {
        key: "has_finished_collecting_for_operation",
        label: "target = <tag> Country towards whom the operation is targeted. operation = <toke",
        scope: "has_finished_collecting_for_operation = { target = POL operation = operation_infiltrate_armed_forces_navy }",
    },
    {
        key: "is_preparing_operation",
        label: "target = <tag> Country towards whom the operation is targeted. operation = <toke",
        scope: "is_preparing_operation = { target = POL operation = operation_infiltrate_armed_forces_navy }",
    },
    {
        key: "is_running_operation",
        label: "target = <tag> Country towards whom the operation is targeted. operation = <toke",
        scope: "is_running_operation = { target = POL operation = operation_infiltrate_armed_forces_navy }",
    },
    {
        key: "num_finished_operations",
        label: "target = <tag> Country towards whom the operation is targeted. operation = <toke",
        scope: "num_finished_operations = { target = POL operation = operation_infiltrate_armed_forces_navy }",
    },
    {
        key: "has_operation_token",
        label: "tag = <tag> Country towards whom the operation is targeted. token = <token> The ",
        scope: "has_operation_token = { tag = POL token = token_name }",
    },
    {
        key: "is_active_decryption_bonuses_enabled",
        label: "<tag> The country towards which the bonus is enabled.",
        scope: "is_active_decryption_bonuses_enabled = POL",
    },
    {
        key: "is_cryptology_department_active",
        label: "<bool> Boolean.",
        scope: "is_cryptology_department_active = yes",
    },
    {
        key: "is_decrypting",
        label: "<tag> The country which is decrypted.",
        scope: "is_decrypting = POL",
    },
    {
        key: "is_fully_decrypted",
        label: "<tag> The country which is decrypted.",
        scope: "is_fully_decrypted = POL",
    },
    {
        key: "num_fake_intel_divisions",
        label: "<int> Amount of divisions.",
        scope: "num_fake_intel_divisions > 10",
    },
    {
        key: "num_free_operative_slots",
        label: "<int> Amount of slots.",
        scope: "num_free_operative_slots > 2",
    },
    {
        key: "num_operative_slots",
        label: "<int> Amount of slots.",
        scope: "num_operative_slots > 2",
    },
    {
        key: "num_of_operatives",
        label: "<int> Amount of operatives.",
        scope: "num_of_operatives > 2",
    },
    {
        key: "ai_irrationality",
        label: "<int> The amount to check for.",
        scope: "ai_irrationality > 10",
    },
    {
        key: "ai_liberate_desire",
        label: "target = <scope> The country to check for. count = <float> The amount to check f",
        scope: "ai_liberate_desire = { target = GER count > 1 }",
    },
    {
        key: "ai_has_role_division",
        label: "<string> The role to check for.",
        scope: "ai_has_role_division = infantry",
    },
    {
        key: "ai_has_role_template",
        label: "<string> The role to check for.",
        scope: "ai_has_role_template = armor",
    },
    {
        key: "ai_wants_divisions",
        label: "<int> The amount to check for.",
        scope: "ai_wants_divisions > 10",
    },
    {
        key: "has_template_ai_majority_unit",
        label: "<string> The unit to check for.",
        scope: "has_template_ai_majority_unit = infantry",
    },
    {
        key: "can_be_country_leader",
        label: "<character> The character to check.",
        scope: "can_be_country_leader = POL_character_test",
    },
    {
        key: "has_country_leader_ideology",
        label: "<ideology> Checks the ideology of the active country leader",
        scope: "has_country_leader_ideology = nazism",
    },
    {
        key: "has_country_leader_with_trait",
        label: "<string> The trait to check.",
        scope: "has_country_leader_with_trait = champion_of_peace_1",
    },
    {
        key: "is_female",
        label: "<bool> Boolean.",
        scope: "is_female = yes",
    },
    {
        key: "has_unit_leader",
        label: "<int> The id to check for.",
        scope: "has_unit_leader = 1",
    },
    {
        key: "has_scientist_specialization",
        label: "specialization = <specialization_token> Specialization.",
        scope: "has_scientist_specialization = specialization_nuclear",
    },
    {
        key: "pc_is_winner",
        label: "<bool> Boolean.",
        scope: "pc_is_winner = yes",
    },
    {
        key: "pc_is_on_winning_side",
        label: "<bool> Boolean.",
        scope: "pc_is_on_winning_side = yes",
    },
    {
        key: "pc_is_loser",
        label: "<bool> Boolean.",
        scope: "pc_is_loser = yes",
    },
    {
        key: "pc_is_untouched_loser",
        label: "<bool> Boolean.",
        scope: "pc_is_untouched_loser = yes",
    },
    {
        key: "pc_is_on_same_side_as",
        label: "<scope> Country to check for.",
        scope: "pc_is_on_same_side_as = BHR",
    },
    {
        key: "pc_is_liberated",
        label: "<bool> Boolean.",
        scope: "pc_is_liberated = yes",
    },
    {
        key: "pc_is_liberated_by",
        label: "<scope> Country to check for.",
        scope: "pc_is_liberated_by = BHR",
    },
    {
        key: "pc_is_puppeted",
        label: "<bool> Boolean.",
        scope: "pc_is_puppeted = yes",
    },
    {
        key: "pc_is_puppeted_by",
        label: "<scope> Country to check for.",
        scope: "pc_is_puppeted_by = BHR",
    },
    {
        key: "pc_is_forced_government",
        label: "<bool> Boolean.",
        scope: "pc_is_forced_government = yes",
    },
    {
        key: "pc_is_forced_government_by",
        label: "<scope> Country to check for.",
        scope: "pc_is_forced_government_by = BHR",
    },
    {
        key: "pc_is_forced_government_to",
        label: "<ideology group> Ideology group to check for.",
        scope: "pc_is_forced_government_to = democratic",
    },
    {
        key: "pc_total_score",
        label: "<decimal> Scope to check for.",
        scope: "pc_total_score > 2400",
    },
    {
        key: "pc_current_score",
        label: "<decimal> Scope to check for.",
        scope: "pc_current_score > 100",
    },
    {
        key: "state",
        label: "<scope> / <variable> The state to check for.",
        scope: "state = 10 state = var:state",
    },
    {
        key: "region",
        label: "<int> The strategic region id to check for.",
        scope: "region = 10",
    },
    {
        key: "free_building_slots",
        label: "building = <string> The building to check for. size = <int> The amount to check ",
        scope: "free_building_slots = { building = arms_factory size > 10 include_locked = yes }",
    },
    {
        key: "non_damaged_building_level",
        label: "building = <string> The building to check for. level = <int> The amount to check",
        scope: "non_damaged_building_level = { building = arms_factory level > 4 }",
    },
    {
        key: "has_state_flag",
        label: "<string> The flag to check for.",
        scope: "has_state_flag = my_flag",
    },
    {
        key: "state_population",
        label: "<float> The amount to check for.",
        scope: "state_population > 10000",
    },
    {
        key: "state_population_k",
        label: "<float> The amount to check for.",
        scope: "state_population_k > 10",
    },
    {
        key: "is_capital",
        label: "<bool> Boolean.",
        scope: "is_capital = yes",
    },
    {
        key: "is_controlled_by",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_controlled_by = GER",
    },
    {
        key: "is_fully_controlled_by",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_fully_controlled_by = GER",
    },
    {
        key: "is_owned_by",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_owned_by = GER",
    },
    {
        key: "is_claimed_by",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_claimed_by = GER",
    },
    {
        key: "is_owned_and_controlled_by",
        label: "<scope> / <variable> The country to check for.",
        scope: "is_owned_and_controlled_by = GER",
    },
    {
        key: "is_demilitarized_zone",
        label: "<bool> Boolean.",
        scope: "is_demilitarized_zone = yes",
    },
    {
        key: "is_border_conflict",
        label: "<bool> Boolean.",
        scope: "is_border_conflict = yes",
    },
    {
        key: "is_in_home_area",
        label: "<bool> Boolean.",
        scope: "is_in_home_area = yes",
    },
    {
        key: "is_coastal",
        label: "<bool> Boolean.",
        scope: "is_coastal = yes",
    },
    {
        key: "is_one_state_island",
        label: "<bool> Boolean.",
        scope: "is_one_state_island = yes",
    },
    {
        key: "is_island_state",
        label: "<bool> Boolean.",
        scope: "is_island_state = yes",
    },
    {
        key: "is_on_continent",
        label: "<string> The continent to check for.",
        scope: "is_on_continent = europe",
    },
    {
        key: "impassable",
        label: "<bool> Boolean.",
        scope: "impassable = yes",
    },
    {
        key: "has_state_category",
        label: "<string> The category to check for.",
        scope: "has_state_category = rural",
    },
    {
        key: "state_strategic_value",
        label: "<int> The amount to check for.",
        scope: "state_strategic_value > 10",
    },
    {
        key: "state_and_terrain_strategic_value",
        label: "<int> The amount to check for.",
        scope: "state_and_terrain_strategic_value > 10",
    },
    {
        key: "num_owned_neighbour_states",
        label: "owner = <scope> The country to check for. count = <int> The amount to check for.",
        scope: "num_owned_neighbour_states = { owner = GER count > 2 }",
    },
    {
        key: "distance_to",
        label: "value = <float> The distance to check for. target = <scope> The state to compare",
        scope: "distance_to = { value > 1000 target = 49 }",
    },
    {
        key: "ships_in_area",
        label: "area = <int> The strategic region to check for. size = <int> The amount to check",
        scope: "ships_in_area = { area = 104 size > 14 }",
    },
    {
        key: "has_resources_amount",
        label: "resource = <string> The resource to check for. amount = <int> The amount to chec",
        scope: "has_resources_amount = { resource = oil amount > 10 delivered = yes }",
    },
    {
        key: "days_since_last_strategic_bombing",
        label: "<int> The amount to compare with.",
        scope: "days_since_last_strategic_bombing < 10",
    },
    {
        key: "has_railway_connection",
        label: "<scope> / <variable> The states to check. <id> The provinces to check. Optional.",
        scope: "has_railway_connection = { start_state = 10 target_state = 90 } has_railway_connection = { start_province = 402 target_province = 9400 }",
    },
    {
        key: "can_build_railway",
        label: "<scope> / <variable> The states to check. <id> The provinces to check. Optional.",
        scope: "can_build_railway = { start_state = 10 target_state = 90 } can_build_railway = { start_province = 402 target_province = 9400 }",
    },
    {
        key: "has_railway_level",
        label: "<scope> / <variable> The states to check. <int> Railway level.",
        scope: "has_railway_level = { state = 114 level = 5 }",
    },
    {
        key: "pc_does_state_stack_demilitarized",
        label: "<bool> Boolean.",
        scope: "pc_does_state_stack_demilitarized = yes",
    },
    {
        key: "pc_does_state_stack_dismantled",
        label: "<bool> Boolean.",
        scope: "pc_does_state_stack_dismantled = yes",
    },
    {
        key: "pc_is_state_claimed",
        label: "<scope> Country to check for.",
        scope: "pc_is_state_claimed = yes",
    },
    {
        key: "pc_is_state_claimed_by",
        label: "<scope> Country to check for.",
        scope: "pc_is_state_claimed_by = BHR",
    },
    {
        key: "pc_is_state_claimed_and_taken_by",
        label: "<scope> Country to check for.",
        scope: "pc_is_state_claimed_and_taken_by = SOV",
    },
    {
        key: "pc_is_state_outside_influence_for_winner",
        label: "<scope> Country to check for.",
        scope: "pc_is_state_outside_influence_for_winner = ROOT",
    },
    {
        key: "pc_turn",
        label: "<int> The amount of turns to check for.",
        scope: "pc_turn > 20",
    },
    {
        key: "can_construct_building",
        label: "<build type> The type of building.",
        scope: "can_construct_building = bunker",
    },
    {
        key: "compliance",
        label: "<int> The amount to compare with.",
        scope: "compliance > 50",
    },
    {
        key: "compliance_speed",
        label: "<int> The amount to compare with.",
        scope: "compliance_speed > 50",
    },
    {
        key: "has_active_resistance",
        label: "<bool> Boolean.",
        scope: "has_active_resistance = yes",
    },
    {
        key: "has_resistance",
        label: "<bool> Boolean.",
        scope: "has_resistance = yes",
    },
    {
        key: "resistance",
        label: "<int> The amount to compare with.",
        scope: "resistance > 50",
    },
    {
        key: "resistance_speed",
        label: "<int> The amount to compare with.",
        scope: "resistance_speed > 50",
    },
    {
        key: "resistance_target",
        label: "<int> The amount to compare with.",
        scope: "resistance_target > 50",
    },
    {
        key: "has_occupation_modifier",
        label: "<token> The occupation modifier to check.",
        scope: "has_occupation_modifier = modifier_name",
    },
    {
        key: "occupied_country_tag",
        label: "<tag> The occupation tag to check.",
        scope: "occupied_country_tag = POL",
    },
    {
        key: "is_character",
        label: "<scope> Character ID.",
        scope: "is_character = POL_test_character",
    },
    {
        key: "is_country_leader",
        label: "<bool> Boolean.",
        scope: "is_country_leader = yes",
    },
    {
        key: "is_unit_leader",
        label: "<bool> Boolean.",
        scope: "is_unit_leader = yes",
    },
    {
        key: "is_advisor",
        label: "<bool> Boolean.",
        scope: "is_advisor = yes",
    },
    {
        key: "is_air_chief",
        label: "<bool> Boolean.",
        scope: "is_air_chief = yes",
    },
    {
        key: "is_army_chief",
        label: "<bool> Boolean.",
        scope: "is_army_chief = yes",
    },
    {
        key: "is_army_leader",
        label: "<bool> Boolean.",
        scope: "is_army_leader = yes",
    },
    {
        key: "is_navy_chief",
        label: "<bool> Boolean.",
        scope: "is_navy_chief = yes",
    },
    {
        key: "is_navy_leader",
        label: "<bool> Boolean.",
        scope: "is_navy_leader = yes",
    },
    {
        key: "is_high_command",
        label: "<bool> Boolean.",
        scope: "is_high_command = yes",
    },
    {
        key: "is_corps_commander",
        label: "<bool> Boolean.",
        scope: "is_corps_commander = yes",
    },
    {
        key: "is_operative",
        label: "<bool> Boolean.",
        scope: "is_operative = yes",
    },
    {
        key: "is_political_advisor",
        label: "<bool> Boolean.",
        scope: "is_political_advisor = yes",
    },
    {
        key: "is_theorist",
        label: "<bool> Boolean.",
        scope: "is_theorist = yes",
    },
    {
        key: "is_character_slot",
        label: "<string> The advisor slot to check.",
        scope: "is_character_slot = political_advisor",
    },
    {
        key: "has_air_ledger",
        label: "<bool> Boolean.",
        scope: "has_air_ledger = yes",
    },
    {
        key: "has_army_ledger",
        label: "<bool> Boolean.",
        scope: "has_army_ledger = yes",
    },
    {
        key: "has_navy_ledger",
        label: "<bool> Boolean.",
        scope: "has_navy_ledger = yes",
    },
    {
        key: "has_character_flag",
        label: "<string> The flag to check for.",
        scope: "has_character_flag = my_flag",
    },
    {
        key: "has_trait",
        label: "<trait> The trait to check for.",
        scope: "has_trait = really_good_boss",
    },
    {
        key: "has_id",
        label: "<int> The id to check for.",
        scope: "has_id = 1",
    },
    {
        key: "is_hired_as_advisor",
        label: "<bool> Boolean.",
        scope: "is_hired_as_advisor = yes",
    },
    {
        key: "not_already_hired_except_as",
        label: "<slot> The slot to check in.",
        scope: "not_already_hired_except_as = political_advisor",
    },
    {
        key: "advisor_can_be_fired",
        label: "<bool> Boolean. OR slot = <slot> The slot to check in.",
        scope: "advisor_can_be_fired = no advisor_can_be_fired = { slot = political_advisor }",
    },
    {
        key: "has_advisor_role",
        label: "<slot> The slot to check in.",
        scope: "has_advisor_role = political_advisor",
    },
    {
        key: "has_ideology",
        label: "<ideology> The sub-ideology to check for.",
        scope: "has_ideology = liberalism",
    },
    {
        key: "has_ideology_group",
        label: "<ideology> The ideology to check for.",
        scope: "has_ideology_group = democratic",
    },
    {
        key: "has_unit_leader_flag",
        label: "<string> The flag to check for.",
        scope: "has_unit_leader_flag = my_flag",
    },
    {
        key: "is_leading_army",
        label: "<bool> Boolean.",
        scope: "is_leading_army = yes",
    },
    {
        key: "is_leading_army_group",
        label: "<bool> Boolean.",
        scope: "is_leading_army_group = yes",
    },
    {
        key: "is_leading_volunteer_group",
        label: "<tag> Country tag.",
        scope: "is_leading_volunteer_group = POL",
    },
    {
        key: "is_leading_volunteer_group_with_original_country",
        label: "<tag> Country tag.",
        scope: "is_leading_volunteer_group_with_original_country = POL",
    },
    {
        key: "is_field_marshal",
        label: "<bool> Boolean.",
        scope: "is_field_marshal = yes",
    },
    {
        key: "is_assigned",
        label: "<bool> Boolean.",
        scope: "is_assigned = yes",
    },
    {
        key: "can_select_trait",
        label: "<string> The trait to check for.",
        scope: "can_select_trait = offensive_doctrine",
    },
    {
        key: "has_ability",
        label: "<string> The ability to check for.",
        scope: "has_ability = glider_planes",
    },
    {
        key: "skill",
        label: "<int> The amount to check for.",
        scope: "skill > 1",
    },
    {
        key: "skill_advantage",
        label: "<int> The amount to check for.",
        scope: "skill_advantage > 1",
    },
    {
        key: "planning_skill_level",
        label: "<int> The amount to check for.",
        scope: "planning_skill_level > 1",
    },
    {
        key: "logistics_skill_level",
        label: "<int> The amount to check for.",
        scope: "logistics_skill_level > 1",
    },
    {
        key: "defense_skill_level",
        label: "<int> The amount to check for.",
        scope: "defense_skill_level > 1",
    },
    {
        key: "attack_skill_level",
        label: "<int> The amount to check for.",
        scope: "attack_skill_level > 1",
    },
    {
        key: "average_stats",
        label: "<int> The amount to check for.",
        scope: "average_stats > 5",
    },
    {
        key: "is_border_war",
        label: "<bool> Boolean.",
        scope: "is_border_war = yes",
    },
    {
        key: "num_units",
        label: "<int> The amount to check for.",
        scope: "num_units > 5",
    },
    {
        key: "is_exiled_leader",
        label: "<bool> Boolean.",
        scope: "is_exiled_leader = yes",
    },
    {
        key: "is_exiled_leader_from",
        label: "<tag> Country.",
        scope: "is_exiled_leader_from = POL",
    },
    {
        key: "is_leading_army_in_province",
        label: "<province id>",
        scope: "is_leading_army_in_province = 1234",
    },
    {
        key: "has_nationality",
        label: "<tag> The nationality to check.",
        scope: "has_nationality = POL",
    },
    {
        key: "is_operative_captured",
        label: "<bool> Boolean.",
        scope: "is_operative_captured = yes",
    },
    {
        key: "operative_leader_mission",
        label: "<token> Mission.",
        scope: "operative_leader_mission = mission_name",
    },
    {
        key: "operative_leader_operation",
        label: "<token> Operation.",
        scope: "operative_leader_operation = operation_name",
    },
    {
        key: "has_scientist_level",
        label: "level = <int> Level to check. specialization = <specialization_token> Specializa",
        scope: "has_scientist_level = { level > 2 specialization = specialization_nuclear }",
        params: [{"name": "value", "type": "string"}],
    },
    {
        key: "is_active_scientist",
        label: "<bool>",
        scope: "is_scientist_active = yes",
    },
    {
        key: "is_scientist_injured",
        label: "<bool>",
        scope: "is_scientist_injured = yes",
    },
    {
        key: "hardness",
        label: "<float> The amount to check for.",
        scope: "hardness > 0.5",
    },
    {
        key: "armor",
        label: "<float> The amount to check for.",
        scope: "armor > 0.5",
    },
    {
        key: "dig_in",
        label: "<float> The amount to check for.",
        scope: "dig_in > 0.5",
    },
    {
        key: "min_planning",
        label: "<float> The amount to check for.",
        scope: "min_planning > 0.5",
    },
    {
        key: "fastest_unit",
        label: "<float> The speed in km/h to check for.",
        scope: "fastest_unit > 12",
    },
    {
        key: "temperature",
        label: "<float> The temperature in celsius to check for.",
        scope: "temperature > 20",
    },
    {
        key: "reserves",
        label: "<float> The amount to check for.",
        scope: "reserves > 10",
    },
    {
        key: "has_combat_modifier",
        label: "<string> The modifier to check for.",
        scope: "has_combat_modifier = river_crossing",
    },
    {
        key: "is_fighting_in_terrain",
        label: "<string> The terrain to check for.",
        scope: "is_fighting_in_terrain = desert",
    },
    {
        key: "is_fighting_in_weather",
        label: "<string> The weather to check for. OR { <string> <...> <string> } The weather to",
        scope: "is_fighting_in_weather = sandstorm is_fighting_in_weather = { rain_light rain_heavy }",
    },
    {
        key: "phase",
        label: "<bool> Boolean.",
        scope: "phase = yes",
    },
    {
        key: "recon_advantage",
        label: "<bool> Boolean.",
        scope: "recon_advantage > 0",
    },
    {
        key: "night",
        label: "<bool> Boolean.",
        scope: "night = yes",
    },
    {
        key: "frontage_full",
        label: "<bool> Boolean.",
        scope: "frontage_full = yes",
    },
    {
        key: "has_flanked_opponent",
        label: "<bool> Boolean.",
        scope: "has_flanked_opponent = yes",
    },
    {
        key: "has_max_planning",
        label: "<bool> Boolean.",
        scope: "has_max_planning = yes",
    },
    {
        key: "has_reserves",
        label: "<bool> Boolean.",
        scope: "has_reserves = yes",
    },
    {
        key: "is_amphibious_invasion",
        label: "<bool> Boolean.",
        scope: "is_amphibious_invasion = yes",
    },
    {
        key: "is_attacker",
        label: "<bool> Boolean.",
        scope: "is_attacker = yes",
    },
    {
        key: "is_defender",
        label: "<bool> Boolean.",
        scope: "is_defender = yes",
    },
    {
        key: "is_winning",
        label: "<bool> Boolean.",
        scope: "is_winning = yes",
    },
    {
        key: "is_fighting_air_units",
        label: "<bool> Boolean.",
        scope: "is_fighting_air_units = yes",
    },
    {
        key: "less_combat_width_than_opponent",
        label: "<bool> Boolean.",
        scope: "less_combat_width_than_opponent = yes",
    },
    {
        key: "has_carrier_airwings_on_mission",
        label: "<bool> Boolean.",
        scope: "has_carrier_airwings_on_mission = yes",
    },
    {
        key: "has_carrier_airwings_in_own_combat",
        label: "<bool> Boolean.",
        scope: "has_carrier_airwings_in_own_combat = yes",
    },
    {
        key: "has_artillery_ratio",
        label: "<float>",
        scope: "has_artillery_ratio > 0.1",
    },
    {
        key: "has_unit_type",
        label: "<unit_type>",
        scope: "has_unit_type = amphibious_mechanized",
    },
    {
        key: "division_has_majority_template",
        label: "<battalion> Battalion to check for.",
        scope: "division_has_majority_template = light_armor",
    },
    {
        key: "division_has_battalion_in_template",
        label: "<battalion> Battalion to check for.",
        scope: "division_has_battalion_in_template = light_armor",
    },
    {
        key: "unit_strength",
        label: "<float> The amount to check for.",
        scope: "unit_strength < 0.3",
    },
    {
        key: "unit_organization",
        label: "<float> The amount to check for.",
        scope: "unit_organization < 0.3",
    },
    {
        key: "is_unit_template_reserves",
        label: "<bool> Boolean.",
        scope: "is_unit_template_reserves = yes",
    },
    {
        key: "has_officer_name",
        label: "<string> The localization key to check.",
        scope: "has_officer_name = FIN_nikke_parmi",
    },
    {
        key: "is_military_industrial_organization",
        label: "<token> MIO to check.",
        scope: "is_military_industrial_organization = my_mio_token",
    },
    {
        key: "is_mio_visible",
        label: "<bool> Boolean.",
        scope: "is_mio_visible = yes",
    },
    {
        key: "is_mio_available",
        label: "<bool> Boolean.",
        scope: "is_mio_available = yes",
    },
    {
        key: "is_mio_assigned_to_task",
        label: "<bool> Boolean.",
        scope: "is_mio_assigned_to_task = yes",
    },
    {
        key: "has_mio_size",
        label: "<int> Integer.",
        scope: "has_mio_size > 3",
    },
    {
        key: "has_mio_trait",
        label: "<token> Trait to check. OR trait = <token> Trait to check.",
        scope: "has_mio_trait = my_trait_token has_mio_trait = { token = my_trait_token }",
    },
    {
        key: "is_mio_trait_available",
        label: "<token> Trait to check. OR trait = <token> Trait to check. check_mio_parent_comp",
        scope: "is_mio_trait_available = my_trait_token is_mio_trait_available = { token = my_trait_token check_mio_parent_completed = no }",
    },
    {
        key: "is_mio_trait_completed",
        label: "<token> Trait to check. OR trait = <token> Trait to check.",
        scope: "is_mio_trait_completed = my_trait_token is_mio_trait_completed = { token = my_trait_token }",
    },
    {
        key: "has_mio_number_of_completed_traits",
        label: "<int> Integer.",
        scope: "has_mio_number_of_completed_traits < 2",
    },
    {
        key: "has_mio_flag",
        label: "<string> The flag to check.",
        scope: "has_mio_flag = my_flag",
    },
    {
        key: "has_mio_policy",
        label: "<token> Policy to check.",
        scope: "has_mio_policy = my_policy_token",
    },
    {
        key: "has_mio_policy_active",
        label: "<token> Policy to check.",
        scope: "has_mio_policy_active = my_policy_token",
    },
    {
        key: "has_mio_research_category",
        label: "<token> Category to check.",
        scope: "has_mio_research_category = my_research_category_token",
    },
    {
        key: "has_mio_equipment_type",
        label: "<token> Type to check.",
        scope: "has_mio_equipment_type = my_equipment_type_token",
    },
    {
        key: "contract_contains_equipment",
        label: "<token> Type to check.",
        scope: "contract_contains_equipment = infantry_equipment",
    },
    {
        key: "deal_completion",
        label: "<decimal> Progress to compare with.",
        scope: "deal_completition > 0.6",
    },
    {
        key: "seller",
        label: "<country> Country to check.",
        scope: "seller = BHR",
    },
    {
        key: "buyer",
        label: "<country> Country to check.",
        scope: "buyer = OMA",
    },
    {
        key: "has_project_flag",
        label: "<string> The flag to check for. OR flag = <string> The flag to check. value = <i",
        scope: "has_project_flag = my_flag has_project_flag = { flag = my_flag value < 12 date > 1936.3.25 days > 365 }",
    },
    {
        key: "is_free_or_subject_of_root",
        label: "Country",
        scope: "is_free_or_subject_of_root = yes",
    },
    {
        key: "has_same_ideology",
        label: "Country",
        scope: "has_same_ideology = yes",
    },
    {
        key: "is_enemy_ideology",
        label: "Country",
        scope: "is_enemy_ideology = yes",
    },
    {
        key: "controls_or_subject_of",
        label: "State",
        scope: "controls_or_subject_of = yes",
    },
    {
        key: "owns_or_subject_of",
        label: "State",
        scope: "owns_or_subject_of = yes",
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